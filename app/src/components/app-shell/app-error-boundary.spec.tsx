import { AppErrorBoundary } from '@/components/app-shell/app-error-boundary';
import { Logger } from '@/services/logger';
import { act, render, screen } from '@testing-library/react';
import { Component, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type GlobalHandler = (error: unknown, isFatal?: boolean) => void;

class OuterErrorCapture extends Component<{ onError: (error: unknown) => void; children: ReactNode }> {
  override state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  override render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function ThrowsOnRender({ error }: { error: Error }): ReactNode {
  throw error;
}

describe('AppErrorBoundary', () => {
  let logger: Logger;
  let globalHandler: GlobalHandler;
  let reactNativeHandler: ReturnType<typeof vi.fn<GlobalHandler>>;

  beforeEach(() => {
    logger = new Logger();
    reactNativeHandler = vi.fn<GlobalHandler>();
    globalHandler = reactNativeHandler;
    vi.stubGlobal('ErrorUtils', {
      getGlobalHandler: () => globalHandler,
      setGlobalHandler: (handler: GlobalHandler) => {
        globalHandler = handler;
      },
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await logger.clearLogs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders children when nothing throws', () => {
    render(
      <AppErrorBoundary logger={logger} fallback={<p>error page</p>}>
        <p>content</p>
      </AppErrorBoundary>,
    );

    expect(screen.queryByText('content')).not.toBeNull();
    expect(screen.queryByText('error page')).toBeNull();
  });

  it('persists a render error with its component stack before showing the fallback', async () => {
    render(
      <AppErrorBoundary logger={logger} fallback={<p>error page</p>}>
        <ThrowsOnRender error={new Error('render failed')} />
      </AppErrorBoundary>,
    );

    expect(screen.queryByText('error page')).toBeNull();

    await act(async () => {
      await logger.writeQueue;
    });

    expect(screen.queryByText('error page')).not.toBeNull();
    const entry = JSON.parse(await logger.getLogsAsString()) as {
      level: string;
      message: string;
      options: { error: { message: string }; componentStack: string };
    };
    expect(entry.level).toBe('error');
    expect(entry.message).toBe('Uncaught render error');
    expect(entry.options.error.message).toBe('render failed');
    expect(entry.options.componentStack).toContain('ThrowsOnRender');
  });

  it('lets an error from the fallback reach the root', async () => {
    const onError = vi.fn();
    const fallbackError = new Error('fallback failed');

    render(
      <OuterErrorCapture onError={onError}>
        <AppErrorBoundary logger={logger} fallback={<ThrowsOnRender error={fallbackError} />}>
          <ThrowsOnRender error={new Error('render failed')} />
        </AppErrorBoundary>
      </OuterErrorCapture>,
    );

    await act(async () => {
      await logger.writeQueue;
    });

    expect(onError).toHaveBeenCalledWith(fallbackError);
  });

  it('persists a global error before forwarding it to the React Native handler', async () => {
    render(
      <AppErrorBoundary logger={logger} fallback={null}>
        <></>
      </AppErrorBoundary>,
    );
    const error = new Error('timer failed');

    globalHandler(error, true);

    expect(reactNativeHandler).not.toHaveBeenCalled();
    await logger.writeQueue;
    expect(reactNativeHandler).toHaveBeenCalledWith(error, true);
    expect(JSON.parse(await logger.getLogsAsString())).toMatchObject({
      message: 'Uncaught error',
      options: { message: 'timer failed' },
    });
  });

  it('restores the React Native handler on unmount', () => {
    const { unmount } = render(
      <AppErrorBoundary logger={logger} fallback={null}>
        <></>
      </AppErrorBoundary>,
    );
    expect(globalHandler).not.toBe(reactNativeHandler);

    unmount();

    expect(globalHandler).toBe(reactNativeHandler);
  });
});
