import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useOnDismiss } from '@/hooks/useOnDismiss';

function Probe({ onDismiss }: { onDismiss: () => void }) {
  useOnDismiss(onDismiss);
  return null;
}

describe('useOnDismiss', () => {
  it('does not run while mounted, and runs once on unmount', () => {
    const onDismiss = vi.fn();
    const view = render(<Probe onDismiss={onDismiss} />);

    view.rerender(<Probe onDismiss={onDismiss} />);
    expect(onDismiss).not.toHaveBeenCalled();

    view.unmount();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('runs the newest callback, not the one from the first render', () => {
    const first = vi.fn();
    const latest = vi.fn();
    const view = render(<Probe onDismiss={first} />);

    view.rerender(<Probe onDismiss={latest} />);
    view.unmount();

    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it('does not re-run when the callback changes identity', () => {
    const onDismiss = vi.fn();
    const view = render(<Probe onDismiss={() => void onDismiss()} />);

    view.rerender(<Probe onDismiss={() => void onDismiss()} />);
    view.rerender(<Probe onDismiss={() => void onDismiss()} />);

    expect(onDismiss).not.toHaveBeenCalled();
    view.unmount();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
