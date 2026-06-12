export class Logger {
  private readonly maxLogs = 100;
  private logs: {
    level: string;
    message: string;
    options?: unknown;
    timestamp: Date;
  }[] = [];

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

  private store(level: string, message: string, options?: unknown): void {
    this.logs.push({
      level,
      message,
      options: this.serializeValue(options),
      timestamp: new Date(),
    });
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogsAsString(): string {
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

    return this.logs
      .map((entry) => {
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
      })
      .join('\n');
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
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
