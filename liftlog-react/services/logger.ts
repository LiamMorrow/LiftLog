class LoggerImpl {
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

export const Logger = new LoggerImpl();
export type Logger = typeof Logger;
