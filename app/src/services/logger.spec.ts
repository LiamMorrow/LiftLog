/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, beforeEach } from 'vitest';
import { Logger } from './logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
  });

  describe('store and retrieval', () => {
    it('stores log entries with correct level and message', () => {
      logger.log('hello');
      logger.info('world');
      const logs = logger.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0]).toMatchObject({ level: 'log', message: 'hello' });
      expect(logs[1]).toMatchObject({ level: 'info', message: 'world' });
    });

    it('stores timestamps', () => {
      const before = new Date();
      logger.log('test');
      const after = new Date();
      const [entry] = logger.getLogs();
      expect(entry!.timestamp.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(entry!.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('getLogs returns a copy, not the internal array', () => {
      logger.log('test');
      const logs = logger.getLogs();
      logs.push({ level: 'fake', message: 'injected', timestamp: new Date() });
      expect(logger.getLogs()).toHaveLength(1);
    });

    it('respects maxLogs by evicting the oldest entry', () => {
      for (let i = 0; i < 101; i++) {
        logger.log(`message ${i}`);
      }
      const logs = logger.getLogs();
      expect(logs).toHaveLength(100);
      expect(logs[0]!.message).toBe('message 1');
      expect(logs[99]!.message).toBe('message 100');
    });
  });

  describe('clearLogs', () => {
    it('empties the log store', () => {
      logger.log('a');
      logger.log('b');
      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });
  });

  describe('error serialization', () => {
    it('serializes Error options in getLogs', () => {
      const err = new Error('something went wrong');
      logger.error('oops', err);
      const [entry] = logger.getLogs();
      const options = entry!.options as {
        name: string;
        message: string;
        stack: string;
      };
      expect(options.name).toBe('Error');
      expect(options.message).toBe('something went wrong');
      expect(options.stack).toContain('something went wrong');
    });

    it('serializes Error options in getLogsAsString', () => {
      logger.error('oops', new Error('something went wrong'));
      const output = JSON.parse(logger.getLogsAsString());
      expect(output.options.message).toBe('something went wrong');
      expect(output.options.name).toBe('Error');
      expect(output.options.stack).toBeTruthy();
    });

    it('serializes nested errors in getLogsAsString', () => {
      logger.error('oops', { cause: new Error('root cause') });
      const output = JSON.parse(logger.getLogsAsString());
      expect(output.options.cause.message).toBe('root cause');
    });

    it('serializes custom Error subclass properties', () => {
      class HttpError extends Error {
        constructor(
          public readonly statusCode: number,
          message: string,
        ) {
          super(message);
          this.name = 'HttpError';
        }
      }
      logger.error('request failed', new HttpError(404, 'not found'));
      const [entry] = logger.getLogs();
      const options = entry!.options as {
        name: string;
        message: string;
        statusCode: number;
      };
      expect(options.name).toBe('HttpError');
      expect(options.message).toBe('not found');
      expect(options.statusCode).toBe(404);
    });
  });

  describe('getLogsAsString', () => {
    it('returns one JSON line per entry', () => {
      logger.log('first');
      logger.log('second');
      const lines = logger.getLogsAsString().split('\n');
      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0]!)).toMatchObject({
        level: 'log',
        message: 'first',
      });
      expect(JSON.parse(lines[1]!)).toMatchObject({
        level: 'log',
        message: 'second',
      });
    });

    it('returns empty string when no logs', () => {
      expect(logger.getLogsAsString()).toBe('');
    });
  });

  describe('time', () => {
    it('logs completion time for sync actions', () => {
      logger.time('sync-task', () => {});
      const [entry] = logger.getLogs();
      expect(entry!.level).toBe('info');
      expect(entry!.message).toMatch(/^sync-task completed in \d+\.\d{2}ms$/);
    });

    it('logs completion time for async actions', async () => {
      await logger.time('async-task', () => Promise.resolve());
      const [entry] = logger.getLogs();
      expect(entry!.level).toBe('info');
      expect(entry!.message).toMatch(/^async-task completed in \d+\.\d{2}ms$/);
    });

    it('returns the resolved value for async actions', async () => {
      const result = await logger.time('task', () => Promise.resolve(42));
      expect(result).toBe(42);
    });
  });
});
