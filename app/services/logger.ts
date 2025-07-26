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
}
