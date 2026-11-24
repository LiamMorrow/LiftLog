import { ComponentProps, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { setExerciseSearchResult } from '@/store/app';
import { updateExercise } from '@/store/stored-sessions';
import { PageActions } from '@/components/foundation/page-actions';
import { SegmentedListOption } from '@/components/foundation/segmented-list-option';
import { SegmentedListTextInput } from '@/components/foundation/segmented-list-text-input';
import en from '@/i18n/en.json';
import { ExerciseVariationPicker } from './exercise-variation-picker';

const state = vi.hoisted(() => ({ dispatch: vi.fn(), dismiss: vi.fn(), focus: vi.fn() }));
vi.mock('@/store', () => ({ useAppSelector: () => ({}) }));
vi.mock('react-redux', () => ({ useDispatch: () => state.dispatch }));
vi.mock('@/utils/uuid', () => ({ uuid: () => 'new-exercise-id' }));
vi.mock('@tolgee/react', () => ({ useTranslate: () => ({ t: (key: keyof typeof en) => en[key] }) }));
vi.mock('expo-router', () => ({
  useRouter: () => ({ dismiss: state.dismiss }),
  Stack: { Screen: () => null },
}));
vi.mock('@/components/layout/full-height-scroll-view', () => ({
  default: ({ children, floatingChildren }: { children: ReactNode; floatingChildren: ReactNode }) => (
    <div>
      {children}
      {floatingChildren}
    </div>
  ),
}));
vi.mock('@/components/foundation/form', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/components/foundation/app-text', () => ({
  AppText: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
vi.mock('@/components/foundation/segmented-list', () => ({
  SegmentedGroup: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/components/foundation/segmented-list-option', () => ({
  SegmentedListOption: ({ label, selected, onPress }: ComponentProps<typeof SegmentedListOption>) => (
    <button aria-pressed={selected} onClick={onPress}>
      {label}
    </button>
  ),
}));
vi.mock('@/components/foundation/segmented-list-text-input', () => ({
  SegmentedListTextInput: ({
    label,
    value,
    onChangeText,
    autoFocus,
  }: ComponentProps<typeof SegmentedListTextInput>) => (
    <input
      aria-label={label}
      value={value}
      autoFocus={autoFocus}
      onFocus={state.focus}
      onChange={(event) => onChangeText?.((event.target as unknown as { value: string }).value)}
    />
  ),
}));
vi.mock('@/components/foundation/page-actions', () => ({
  PageActions: ({ primary, secondary }: ComponentProps<typeof PageActions>) => (
    <div>
      <button disabled={primary.disabled} onClick={primary.onPress}>
        {primary.label}
      </button>
      {secondary?.map((action) => (
        <button key={action.label} onClick={action.onPress}>
          {action.label}
        </button>
      ))}
    </div>
  ),
}));

const source: ExerciseDescriptor = {
  name: 'Split Squats',
  force: 'push',
  level: 'beginner',
  mechanic: 'compound',
  equipment: 'dumbbell',
  muscles: ['quadriceps'],
  instructions: 'Repeat on the other side.',
  category: 'strength',
};

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

function openPicker() {
  render(<ExerciseVariationPicker exercise={source} requestId="request" />);
}

describe('exercise variation picker', () => {
  it('defaults to None and saves and selects a variation only after confirmation', () => {
    openPicker();
    expect(screen.getByRole('button', { name: 'None', pressed: true })).toBeDefined();
    fireEvent.click(screen.getByText('Left'));
    expect(state.dispatch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Done'));
    const exercise = { ...source, name: 'Split Squats (Left)' };
    expect(state.dispatch.mock.calls).toEqual([
      [updateExercise({ id: 'new-exercise-id', exercise })],
      [setExerciseSearchResult({ requestId: 'request', exercise })],
    ]);
    expect(state.dismiss).toHaveBeenCalledExactlyOnceWith(2);
  });

  it('cancels without saving or selecting anything', () => {
    openPicker();
    fireEvent.click(screen.getByText('Left'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(state.dispatch).not.toHaveBeenCalled();
    expect(state.dismiss).toHaveBeenCalledExactlyOnceWith();
  });

  it('focuses Custom, blocks blank input and saves trimmed text', () => {
    openPicker();
    fireEvent.click(screen.getByText('Custom'));
    const input = screen.getByRole('textbox');
    expect(state.focus).toHaveBeenCalledOnce();
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Done'));
    expect(state.dispatch).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: '  Bent knee  ' } });
    fireEvent.click(screen.getByText('Done'));
    expect(state.dispatch).toHaveBeenCalledWith(
      updateExercise({ id: 'new-exercise-id', exercise: { ...source, name: 'Split Squats (Bent knee)' } }),
    );
  });
});
