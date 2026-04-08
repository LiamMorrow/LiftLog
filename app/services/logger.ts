export class Logger {
  log(message: string): void {
    console.log(message);
  }

  info(message: string): void {
    console.info(message);
  }

  warn(message: string, options: unknown): void {
    console.warn(message, options);
  }

  error(message: string, options: unknown): void {
    console.error(message, options);
  }

  debug(message: string, o: unknown): void {
    console.debug(message, o);
  }

  time(type: string, action: () => Promise<void>): Promise<void>;
  time(type: string, action: () => void): void;
  time(type: string, action: () => Promise<void> | void) {
    const start = performance.now();
    const result = action();
    if (typeof result === 'undefined') {
      this.info(type + ' completed in ' + (performance.now() - start));
    } else {
      return result.then(() =>
        this.info(type + ' completed in ' + (performance.now() - start)),
      );
    }
  }
}
