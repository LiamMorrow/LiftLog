import { describe, it, expect } from 'vitest';
import { createExerciseBlueprint, makeCardioBlueprint, makeSession } from '@/models/session-models/__test__/helpers';
import { groupSupersets } from './superset-groups';

const labels = (supersetFlags: boolean[]) =>
  groupSupersets(
    makeSession(supersetFlags.map((flag, index) => createExerciseBlueprint(index, flag))).recordedExercises,
  ).map((group) => group.members.map((member) => member.label ?? member.index));

describe('groupSupersets', () => {
  it('returns no groups for no exercises', () => {
    expect(groupSupersets([])).toEqual([]);
  });

  it('keeps exercises without supersets on their own, unlabelled', () => {
    expect(labels([false, false, false])).toEqual([[0], [1], [2]]);
  });

  it('letters each superset in order and numbers its members', () => {
    expect(labels([false, true, false, true, true, false])).toEqual([[0], ['A1', 'A2'], ['B1', 'B2', 'B3']]);
  });

  it('leaves a last exercise that supersets with nothing on its own', () => {
    expect(labels([false, true])).toEqual([[0], [1]]);
  });

  it('pulls a cardio exercise after a superset into the group', () => {
    const session = makeSession([createExerciseBlueprint(0, true), makeCardioBlueprint()]);
    const [group] = groupSupersets(session.recordedExercises);
    expect(group).toEqual({
      isSuperset: true,
      members: [
        { index: 0, label: 'A1' },
        { index: 1, label: 'A2' },
      ],
    });
  });
});
