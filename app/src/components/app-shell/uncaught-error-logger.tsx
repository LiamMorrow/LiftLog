import { Logger } from '@/services/logger';
import { Component, ErrorInfo, ReactNode } from 'react';

interface UncaughtErrorLoggerProps {
  logger: Logger;
  children: ReactNode;
}

interface UncaughtErrorLoggerState {
  caught?: { error: unknown };
  isLogPersisted: boolean;
}

export class UncaughtErrorLogger extends Component<UncaughtErrorLoggerProps, UncaughtErrorLoggerState> {
  override state: UncaughtErrorLoggerState = { isLogPersisted: false };

  private restoreGlobalHandler?: () => void;

  static getDerivedStateFromError(error: unknown): Partial<UncaughtErrorLoggerState> {
    return { caught: { error } };
  }

  override componentDidMount() {
    const { logger } = this.props;
    const reactNativeHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
      logger.error('Uncaught error', error);
      void logger.writeQueue.then(() => reactNativeHandler(error, isFatal));
    });
    this.restoreGlobalHandler = () => ErrorUtils.setGlobalHandler(reactNativeHandler);
  }

  override componentWillUnmount() {
    this.restoreGlobalHandler?.();
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    const { logger } = this.props;
    logger.error('Uncaught render error', { error, componentStack: info.componentStack });
    void logger.writeQueue.then(() => this.setState({ isLogPersisted: true }));
  }

  override render() {
    const { caught, isLogPersisted } = this.state;
    if (!caught) {
      return this.props.children;
    }
    if (isLogPersisted) {
      throw caught.error;
    }
    return null;
  }
}
