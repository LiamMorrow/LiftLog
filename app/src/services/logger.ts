import { File, Paths } from 'expo-file-system';
import { uuid } from '@/utils/uuid';

const LOG_FILE_KEY = 'app.log';

function getFile(key: string): File {
  return new File(Paths.join(Paths.document, key));
}

export class Logger {
  private readonly maxLogs = 100;
  private readonly maxFileLines = 500;

  private logs: {
    level: string;
    message: string;
    options?: unknown;
    timestamp: Date;
  }[] = [];

  // Serialized write queue — appends never race each other
  public writeQueue: Promise<void> = Promise.resolve();

  private serializeValue(value: unknown): unknown {
    if (value instanceof Error) {
      return {
        ...value,
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }
    return value;
  }

  private serializeEntry(entry: {
    level: string;
    message: string;
    options?: unknown;
    timestamp: Date;
  }): string {
    const replacer = (_key: string, value: unknown): unknown => {
      if (value instanceof Error) {
        return {
          ...value,
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }
      return value;
    };

    try {
      return JSON.stringify(entry, replacer);
    } catch {
      try {
        return JSON.stringify({
          level: entry.level,
          message: entry.message,
          timestamp: entry.timestamp,
        });
      } catch {
        return `{"level":"${entry.level}","message":"[unserializable]","timestamp":"${entry.timestamp.toISOString()}"}`;
      }
    }
  }

  private async appendToFile(line: string): Promise<void> {
    const finalFile = getFile(LOG_FILE_KEY);
    const tempFile = getFile(LOG_FILE_KEY + '-tmp-' + uuid());

    let existingLines: string[] = [];
    if (finalFile.exists) {
      const existing = await finalFile.text();
      existingLines = existing ? existing.split('\n').filter(Boolean) : [];
    }

    existingLines.push(line);

    // Trim to maxFileLines so the file doesn't grow unbounded
    if (existingLines.length > this.maxFileLines) {
      existingLines = existingLines.slice(
        existingLines.length - this.maxFileLines,
      );
    }

    const content = existingLines.join('\n') + '\n';

    tempFile.create();
    tempFile.write(content);

    if (finalFile.exists) {
      finalFile.delete();
    }
    await tempFile.move(finalFile, { overwrite: true });
  }

  private enqueueWrite(line: string): void {
    this.writeQueue = this.writeQueue
      .then(() => this.appendToFile(line))
      .catch((e) => {
        console.error('Failed to persist logs', e);
        const entry = {
          level: 'error',
          message: 'Failed to persist logs',
          options: this.serializeValue(e),
          timestamp: new Date(),
        };

        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
          this.logs.shift();
        }
      });
  }

  private store(level: string, message: string, options?: unknown): void {
    const entry = {
      level,
      message,
      options: this.serializeValue(options),
      timestamp: new Date(),
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.enqueueWrite(this.serializeEntry(entry));
  }

  async getLogsAsString(): Promise<string> {
    try {
      const file = getFile(LOG_FILE_KEY);
      if (file.exists) {
        return (await file.text()).trim();
      }
    } catch {
      // Fall back to in-memory logs
    }

    return this.logs.map((entry) => this.serializeEntry(entry)).join('\n');
  }

  getLogs() {
    return [...this.logs];
  }

  async clearLogs(): Promise<void> {
    this.logs = [];
    // Wait for any in-flight writes before deleting, otherwise the queue
    // could recreate the file after we delete it
    await this.writeQueue;
    try {
      const file = getFile(LOG_FILE_KEY);
      if (file.exists) {
        file.delete();
      }
    } catch {
      // Swallow
    }
  }

  log(message: string): void {
    this.store('log', message);
    console.log(message);
  }

  info(message: string): void {
    this.store('info', message);
    console.info(message);
  }

  warn(message: string, options: unknown): void {
    this.store('warn', message, options);
    console.warn(message, options);
  }

  error(message: string, options: unknown): void {
    this.store('error', message, options);
    console.error(message, options);
  }

  debug(message: string, o: unknown): void {
    this.store('debug', message, o);
    console.debug(message, o);
  }

  time<T>(type: string, action: () => Promise<T>): Promise<T>;
  time(type: string, action: () => Promise<void>): Promise<void>;
  time(type: string, action: () => void): void;
  time<T>(type: string, action: () => Promise<T | void> | void) {
    const start = performance.now();
    const result = action();
    if (typeof result === 'undefined') {
      this.info(
        type + ' completed in ' + (performance.now() - start).toFixed(2) + 'ms',
      );
    } else {
      return result.then((x) => {
        this.info(
          type +
            ' completed in ' +
            (performance.now() - start).toFixed(2) +
            'ms',
        );
        return x;
      });
    }
  }
}
