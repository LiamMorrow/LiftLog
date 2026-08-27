import { describe, it, expect } from 'vitest';
import { LocalDate } from '@js-joda/core';
import { ProgramBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { makeSession, makeWeightedBlueprint } from '@/models/session-models/__test__/helpers';
import { getPlanDiff } from '@/store/program/helpers';

function programWith(sessions: SessionBlueprint[]) {
  return new ProgramBlueprint('Plan', sessions, LocalDate.of(2025, 4, 5));
}

describe('getPlanDiff', () => {
  it('returns undefined when the session blueprint already matches the plan', () => {
    const session = makeSession([makeWeightedBlueprint({ name: 'Squat' })]);
    const program = programWith([session.blueprint]);
    expect(getPlanDiff(program, session, 'plan-id')).toBeUndefined();
  });

  it('returns a diff against the same-named session in the plan', () => {
    const original = makeSession([makeWeightedBlueprint({ name: 'Squat' })]);
    const edited = original.withAddedExercise(makeWeightedBlueprint({ name: 'Bench' }), false);
    const program = programWith([original.blueprint]);

    const result = getPlanDiff(program, edited, 'plan-id')!;

    expect(result.type).toBe('diff');
    if (result.type === 'diff') {
      expect(result.sessionIndex).toBe(0);
      expect(result.diff.hasChanges).toBe(true);
    }
  });

  it('returns an add diff when no session shares the name', () => {
    const session = makeSession([makeWeightedBlueprint({ name: 'Squat' })]);
    const program = programWith([
      makeSession([makeWeightedBlueprint({ name: 'Row' })]).withName('Cardio Day').blueprint,
    ]);

    const result = getPlanDiff(program, session, 'plan-id')!;

    expect(result.type).toBe('add');
  });

  it('records which plan the diff was computed against', () => {
    const original = makeSession([makeWeightedBlueprint({ name: 'Squat' })]);
    const edited = original.withAddedExercise(makeWeightedBlueprint({ name: 'Bench' }), false);

    expect(getPlanDiff(programWith([original.blueprint]), edited, 'plan-id')?.programId).toBe('plan-id');
    expect(getPlanDiff(programWith([]), edited, 'plan-id')?.programId).toBe('plan-id');
  });
});
