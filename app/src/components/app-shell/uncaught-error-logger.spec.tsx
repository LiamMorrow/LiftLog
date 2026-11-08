import { UncaughtErrorLogger } from '@/components/app-shell/uncaught-error-logger';
import { Logger } from '@/services/logger';
import { act, render } from '@testing-library/react';
import { Component, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type GlobalHandler = (error: unknown, isFatal?: boolean) => void;

class RethrownErrorCapture extends Component<{ onRethrown: (error: unknown) => void; children: ReactNode }> {
  override state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown) {
    this.props.onRethrown(error);
  }

  override render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function ThrowsOnRender({ error }: { error: Error }): ReactNode {
  throw error;
}

describe('UncaughtErrorLogger', () => {
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

  it('persists a render error with its component stack before rethrowing it', async () => {
    const error = new Error('render failed');
    const onRethrown = vi.fn();

    render(
      <RethrownErrorCapture onRethrown={onRethrown}>
        <UncaughtErrorLogger logger={logger}>
          <ThrowsOnRender error={error} />
        </UncaughtErrorLogger>
      </RethrownErrorCapture>,
    );

    expect(onRethrown).not.toHaveBeenCalled();

    await act(async () => {
      await logger.writeQueue;
    });

    expect(onRethrown).toHaveBeenCalledWith(error);
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

  it('persists a global error before forwarding it to the React Native handler', async () => {
    render(
      <UncaughtErrorLogger logger={logger}>
        <></>
      </UncaughtErrorLogger>,
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
      <UncaughtErrorLogger logger={logger}>
        <></>
      </UncaughtErrorLogger>,
    );
    expect(globalHandler).not.toBe(reactNativeHandler);

    unmount();

    expect(globalHandler).toBe(reactNativeHandler);
  });
});
