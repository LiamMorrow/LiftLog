export class Logger {
  log(message: string): void {
    console.log(message);
  }

  info(message: string): void {
    console.info(`INFO: ${message}`);
  }

  warn(message: string): void {
    console.warn(`WARN: ${message}`);
  }

  error(message: string): void {
    console.error(`ERROR: ${message}`);
  }

  debug(message: string): void {
    console.debug(`DEBUG: ${message}`);
  }
}
