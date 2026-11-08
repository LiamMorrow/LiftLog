import { Logger } from '@/services/logger';
import { Component, ErrorInfo, ReactNode } from 'react';

interface AppErrorBoundaryProps {
  logger: Logger;
  fallback: ReactNode;
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasCaughtError: boolean;
  isLogPersisted: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { hasCaughtError: false, isLogPersisted: false };

  private restoreGlobalHandler?: () => void;

  static getDerivedStateFromError(): Partial<AppErrorBoundaryState> {
    return { hasCaughtError: true };
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
    const { hasCaughtError, isLogPersisted } = this.state;
    if (!hasCaughtError) {
      return this.props.children;
    }
    return isLogPersisted ? this.props.fallback : null;
  }
}
