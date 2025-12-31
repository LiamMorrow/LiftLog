import BigNumber from 'bignumber.js';
import { match } from 'ts-pattern';
import {
  CardioExerciseBlueprint,
  CardioTarget,
  ExerciseBlueprint,
  Rest,
  SessionBlueprint,
  SessionBlueprintPOJO,
  WeightedExerciseBlueprint,
} from './blueprint-models';
import { TranslationKey } from '@tolgee/react';
import { uuid } from '@/utils/uuid';
import { EmptySession } from '@/models/session-models';

// ============================================================================
// Change Types
// ============================================================================

export type ChangeType = 'added' | 'removed' | 'modified' | 'reordered';

/**
 * Base interface for all changes. Each change has a unique ID for selection.
 */
export interface BaseChange {
  id: string;
  type: ChangeType;
}

// ============================================================================
// Session-Level Changes
// ============================================================================

export interface SessionNameChange extends BaseChange {
  kind: 'sessionName';
  type: 'modified';
  oldValue: string;
  newValue: string;
}

export interface SessionNotesChange extends BaseChange {
  kind: 'sessionNotes';
  type: 'modified';
  oldValue: string;
  newValue: string;
}

export type SessionChange = SessionNameChange | SessionNotesChange;

// ============================================================================
// Exercise-Level Changes
// ============================================================================

export interface ExerciseAddedChange extends BaseChange {
  kind: 'exercise';
  type: 'added';
  exercise: ExerciseBlueprint;
  newIndex: number;
}

export interface ExerciseRemovedChange extends BaseChange {
  kind: 'exercise';
  type: 'removed';
  exercise: ExerciseBlueprint;
  oldIndex: number;
}

export interface ExerciseReorderedChange extends BaseChange {
  kind: 'exercise';
  type: 'reordered';
  exerciseName: string;
  oldIndex: number;
  newIndex: number;
}

export type ExerciseStructureChange =
  | ExerciseAddedChange
  | ExerciseRemovedChange
  | ExerciseReorderedChange;

// ============================================================================
// Exercise Field Changes (for modified exercises)
// ============================================================================

export interface ExerciseNameChange extends BaseChange {
  kind: 'exerciseName';
  type: 'modified';
  exerciseIndex: number;
  oldValue: string;
  newValue: string;
}

export interface ExerciseSetsChange extends BaseChange {
  kind: 'exerciseSets';
  type: 'modified';
  exerciseName: string;
  exerciseIndex: number;
  oldValue: number;
  newValue: number;
}

export interface ExerciseRepsChange extends BaseChange {
  kind: 'exerciseReps';
  type: 'modified';
  exerciseName: string;
  exerciseIndex: number;
  oldValue: number;
  newValue: number;
}

export interface ExerciseWeightIncreaseChange extends BaseChange {
  kind: 'exerciseWeightIncrease';
  type: 'modified';
  exerciseName: string;
  exerciseIndex: number;
  oldValue: BigNumber;
  newValue: BigNumber;
}

/** Grouped rest settings change */
export interface ExerciseRestChange extends BaseChange {
  kind: 'exerciseRest';
  type: 'modified';
  exerciseName: string;
  exerciseIndex: number;
  oldValue: Rest;
  newValue: Rest;
}

export interface ExerciseSupersetChange extends BaseChange {
  kind: 'exerciseSuperset';
  type: 'modified';
  exerciseName: string;
  exerciseIndex: number;
  oldValue: boolean;
  newValue: boolean;
}

export interface ExerciseNotesChange extends BaseChange {
  kind: 'exerciseNotes';
  type: 'modified';
  exerciseName: string;
  exerciseIndex: number;
  oldValue: string;
  newValue: string;
}

export interface ExerciseLinkChange extends BaseChange {
  kind: 'exerciseLink';
  type: 'modified';
  exerciseName: string;
  exerciseIndex: number;
  oldValue: string;
  newValue: string;
}

// Cardio-specific changes
export interface ExerciseTargetChange extends BaseChange {
  kind: 'exerciseTarget';
  type: 'modified';
  exerciseName: string;
  exerciseIndex: number;
  oldValue: CardioTarget;
  newValue: CardioTarget;
}

export interface ExerciseTrackingChange extends BaseChange {
  kind: 'exerciseTracking';
  type: 'modified';
  exerciseName: string;
  exerciseIndex: number;
  field: 'trackDuration' | 'trackDistance' | 'trackResistance' | 'trackIncline';
  oldValue: boolean;
  newValue: boolean;
}

/** Exercise type changed (weighted <-> cardio) */
export interface ExerciseTypeChange extends BaseChange {
  kind: 'exerciseType';
  type: 'modified';
  exerciseIndex: number;
  oldExercise: ExerciseBlueprint;
  newExercise: ExerciseBlueprint;
}

export type ExerciseFieldChange =
  | ExerciseNameChange
  | ExerciseSetsChange
  | ExerciseRepsChange
  | ExerciseWeightIncreaseChange
  | ExerciseRestChange
  | ExerciseSupersetChange
  | ExerciseNotesChange
  | ExerciseLinkChange
  | ExerciseTargetChange
  | ExerciseTrackingChange
  | ExerciseTypeChange;

// ============================================================================
// Aggregated Types
// ============================================================================

export type DiffChange =
  | SessionChange
  | ExerciseStructureChange
  | ExerciseFieldChange;

/**
 * Groups all changes for a single exercise that was modified
 */
export interface ExerciseModification {
  exerciseName: string;
  exerciseIndex: number;
  changes: ExerciseFieldChange[];
}

export type PlanDiff =
  | {
      type: 'diff';
      sessionIndex: number;
      diff: SessionBlueprintDiff;
    }
  | {
      type: 'add';
      diff: SessionBlueprintDiff;
    };

export const EmptySessionBlueprintDiff: SessionBlueprintDiff = {
  hasChanges: false,
  addedExercises: [],
  allChanges: [],
  modifiedExercises: [],
  removedExercises: [],
  reorderedExercises: [],
  sessionChanges: [],
  originalSession: EmptySession.blueprint.toPOJO(),
  newSession: EmptySession.blueprint.toPOJO(),
};

/**
 * The complete diff between two SessionBlueprints
 */
export interface SessionBlueprintDiff {
  /** True if there are any changes */
  hasChanges: boolean;

  /** Session-level changes (name, notes) */
  sessionChanges: SessionChange[];

  /** Exercises that were added */
  addedExercises: ExerciseAddedChange[];

  /** Exercises that were removed */
  removedExercises: ExerciseRemovedChange[];

  /** Exercises that were reordered (but not added/removed) */
  reorderedExercises: ExerciseReorderedChange[];

  /** Exercises that were modified (field-level changes) */
  modifiedExercises: ExerciseModification[];

  /** Flat list of all changes for easy iteration */
  allChanges: DiffChange[];

  originalSession: SessionBlueprintPOJO;
  newSession: SessionBlueprintPOJO;
}

// ============================================================================
// Diff Implementation
// ============================================================================

function generateChangeId(): string {
  return `change_${uuid()}`;
}

interface MatchedExercise {
  oldExercise: ExerciseBlueprint;
  newExercise: ExerciseBlueprint;
  oldIndex: number;
  newIndex: number;
}

interface ExerciseWithIndex {
  exercise: ExerciseBlueprint;
  index: number;
}

/**
 * Match exercises by name. For duplicate names, fall back to position matching.
 */
function matchExercisesByName(
  oldExercises: ExerciseBlueprint[],
  newExercises: ExerciseBlueprint[],
): {
  matched: MatchedExercise[];
  added: ExerciseWithIndex[];
  removed: ExerciseWithIndex[];
} {
  const matched: MatchedExercise[] = [];
  const added: ExerciseWithIndex[] = [];
  const removed: ExerciseWithIndex[] = [];

  // Track which exercises have been matched
  const matchedOldIndices = new Set<number>();
  const matchedNewIndices = new Set<number>();

  // Group exercises by name for both old and new
  const oldByName = new Map<string, number[]>();
  const newByName = new Map<string, number[]>();

  oldExercises.forEach((ex, idx) => {
    const indices = oldByName.get(ex.name) ?? [];
    indices.push(idx);
    oldByName.set(ex.name, indices);
  });

  newExercises.forEach((ex, idx) => {
    const indices = newByName.get(ex.name) ?? [];
    indices.push(idx);
    newByName.set(ex.name, indices);
  });

  // Match by name, handling duplicates by position within the name group
  for (const [name, oldIndices] of oldByName) {
    const newIndices = newByName.get(name) ?? [];

    // Match exercises with the same name by their relative position
    const matchCount = Math.min(oldIndices.length, newIndices.length);
    for (let i = 0; i < matchCount; i++) {
      const oldIdx = oldIndices[i];
      const newIdx = newIndices[i];
      matched.push({
        oldExercise: oldExercises[oldIdx],
        newExercise: newExercises[newIdx],
        oldIndex: oldIdx,
        newIndex: newIdx,
      });
      matchedOldIndices.add(oldIdx);
      matchedNewIndices.add(newIdx);
    }
  }

  // Collect unmatched as removed/added
  oldExercises.forEach((ex, idx) => {
    if (!matchedOldIndices.has(idx)) {
      removed.push({ exercise: ex, index: idx });
    }
  });

  newExercises.forEach((ex, idx) => {
    if (!matchedNewIndices.has(idx)) {
      added.push({ exercise: ex, index: idx });
    }
  });

  return { matched, added, removed };
}

function restEquals(a: Rest, b: Rest): boolean {
  return (
    a.minRest.equals(b.minRest) &&
    a.maxRest.equals(b.maxRest) &&
    a.failureRest.equals(b.failureRest)
  );
}

function cardioTargetEquals(a: CardioTarget, b: CardioTarget): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'time' && b.type === 'time') {
    return a.value.equals(b.value);
  }
  if (a.type === 'distance' && b.type === 'distance') {
    return a.value.value.eq(b.value.value) && a.value.unit === b.value.unit;
  }
  return false;
}

function diffWeightedExercises(
  oldEx: WeightedExerciseBlueprint,
  newEx: WeightedExerciseBlueprint,
  exerciseIndex: number,
): ExerciseFieldChange[] {
  const changes: ExerciseFieldChange[] = [];
  const exerciseName = newEx.name;

  if (oldEx.name !== newEx.name) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseName',
      type: 'modified',
      exerciseIndex,
      oldValue: oldEx.name,
      newValue: newEx.name,
    });
  }

  if (oldEx.sets !== newEx.sets) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseSets',
      type: 'modified',
      exerciseName,
      exerciseIndex,
      oldValue: oldEx.sets,
      newValue: newEx.sets,
    });
  }

  if (oldEx.repsPerSet !== newEx.repsPerSet) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseReps',
      type: 'modified',
      exerciseName,
      exerciseIndex,
      oldValue: oldEx.repsPerSet,
      newValue: newEx.repsPerSet,
    });
  }

  if (!oldEx.weightIncreaseOnSuccess.eq(newEx.weightIncreaseOnSuccess)) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseWeightIncrease',
      type: 'modified',
      exerciseName,
      exerciseIndex,
      oldValue: oldEx.weightIncreaseOnSuccess,
      newValue: newEx.weightIncreaseOnSuccess,
    });
  }

  // Grouped rest change
  if (!restEquals(oldEx.restBetweenSets, newEx.restBetweenSets)) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseRest',
      type: 'modified',
      exerciseName,
      exerciseIndex,
      oldValue: oldEx.restBetweenSets,
      newValue: newEx.restBetweenSets,
    });
  }

  if (oldEx.supersetWithNext !== newEx.supersetWithNext) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseSuperset',
      type: 'modified',
      exerciseName,
      exerciseIndex,
      oldValue: oldEx.supersetWithNext,
      newValue: newEx.supersetWithNext,
    });
  }

  if (oldEx.notes !== newEx.notes) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseNotes',
      type: 'modified',
      exerciseName,
      exerciseIndex,
      oldValue: oldEx.notes,
      newValue: newEx.notes,
    });
  }

  if (oldEx.link !== newEx.link) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseLink',
      type: 'modified',
      exerciseName,
      exerciseIndex,
      oldValue: oldEx.link,
      newValue: newEx.link,
    });
  }

  return changes;
}

function diffCardioExercises(
  oldEx: CardioExerciseBlueprint,
  newEx: CardioExerciseBlueprint,
  exerciseIndex: number,
): ExerciseFieldChange[] {
  const changes: ExerciseFieldChange[] = [];
  const exerciseName = newEx.name;

  if (oldEx.name !== newEx.name) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseName',
      type: 'modified',
      exerciseIndex,
      oldValue: oldEx.name,
      newValue: newEx.name,
    });
  }

  if (!cardioTargetEquals(oldEx.target, newEx.target)) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseTarget',
      type: 'modified',
      exerciseName,
      exerciseIndex,
      oldValue: oldEx.target,
      newValue: newEx.target,
    });
  }

  const trackingFields = [
    'trackDuration',
    'trackDistance',
    'trackResistance',
    'trackIncline',
  ] as const;

  for (const field of trackingFields) {
    if (oldEx[field] !== newEx[field]) {
      changes.push({
        id: generateChangeId(),
        kind: 'exerciseTracking',
        type: 'modified',
        exerciseName,
        exerciseIndex,
        field,
        oldValue: oldEx[field],
        newValue: newEx[field],
      });
    }
  }

  if (oldEx.notes !== newEx.notes) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseNotes',
      type: 'modified',
      exerciseName,
      exerciseIndex,
      oldValue: oldEx.notes,
      newValue: newEx.notes,
    });
  }

  if (oldEx.link !== newEx.link) {
    changes.push({
      id: generateChangeId(),
      kind: 'exerciseLink',
      type: 'modified',
      exerciseName,
      exerciseIndex,
      oldValue: oldEx.link,
      newValue: newEx.link,
    });
  }

  return changes;
}

function diffExercises(
  oldEx: ExerciseBlueprint,
  newEx: ExerciseBlueprint,
  exerciseIndex: number,
): ExerciseFieldChange[] {
  // Check if exercise type changed
  const oldIsWeighted = oldEx instanceof WeightedExerciseBlueprint;
  const newIsWeighted = newEx instanceof WeightedExerciseBlueprint;

  if (oldIsWeighted !== newIsWeighted) {
    return [
      {
        id: generateChangeId(),
        kind: 'exerciseType',
        type: 'modified',
        exerciseIndex,
        oldExercise: oldEx,
        newExercise: newEx,
      },
    ];
  }

  if (oldIsWeighted && newIsWeighted) {
    return diffWeightedExercises(oldEx, newEx, exerciseIndex);
  }

  return diffCardioExercises(
    oldEx as CardioExerciseBlueprint,
    newEx as CardioExerciseBlueprint,
    exerciseIndex,
  );
}

/**
 * Computes the diff between two SessionBlueprint instances.
 *
 * Uses name-based matching for exercises with fallback to position for duplicates.
 * Rest settings are grouped as a single change.
 * Reordering is detected as a separate change type.
 */
export function diffSessionBlueprints(
  original: SessionBlueprint,
  modified: SessionBlueprint,
): SessionBlueprintDiff {
  const sessionChanges: SessionChange[] = [];
  const allChanges: DiffChange[] = [];

  // Session-level changes
  if (original.name !== modified.name) {
    const change: SessionNameChange = {
      id: generateChangeId(),
      kind: 'sessionName',
      type: 'modified',
      oldValue: original.name,
      newValue: modified.name,
    };
    sessionChanges.push(change);
    allChanges.push(change);
  }

  if (original.notes !== modified.notes) {
    const change: SessionNotesChange = {
      id: generateChangeId(),
      kind: 'sessionNotes',
      type: 'modified',
      oldValue: original.notes,
      newValue: modified.notes,
    };
    sessionChanges.push(change);
    allChanges.push(change);
  }

  // Match exercises
  const { matched, added, removed } = matchExercisesByName(
    original.exercises,
    modified.exercises,
  );

  // Added exercises
  const addedExercises: ExerciseAddedChange[] = added.map(
    ({ exercise, index }) => ({
      id: generateChangeId(),
      kind: 'exercise',
      type: 'added',
      exercise,
      newIndex: index,
    }),
  );

  // Removed exercises
  const removedExercises: ExerciseRemovedChange[] = removed.map(
    ({ exercise, index }) => ({
      id: generateChangeId(),
      kind: 'exercise',
      type: 'removed',
      exercise,
      oldIndex: index,
    }),
  );

  // Reordered exercises (matched but at different indices)
  const reorderedExercises: ExerciseReorderedChange[] = matched
    .filter(({ oldIndex, newIndex }) => oldIndex !== newIndex)
    .map(({ oldExercise, oldIndex, newIndex }) => ({
      id: generateChangeId(),
      kind: 'exercise',
      type: 'reordered',
      exerciseName: oldExercise.name,
      oldIndex,
      newIndex,
    }));

  // Modified exercises (field-level changes)
  const modifiedExercises: ExerciseModification[] = [];
  for (const { oldExercise, newExercise, newIndex } of matched) {
    const changes = diffExercises(oldExercise, newExercise, newIndex);
    if (changes.length > 0) {
      modifiedExercises.push({
        exerciseName: newExercise.name,
        exerciseIndex: newIndex,
        changes,
      });
    }
  }

  // Collect all changes
  allChanges.push(...addedExercises);
  allChanges.push(...removedExercises);
  allChanges.push(...reorderedExercises);
  for (const mod of modifiedExercises) {
    allChanges.push(...mod.changes);
  }

  return {
    hasChanges: allChanges.length > 0,
    sessionChanges,
    addedExercises,
    removedExercises,
    reorderedExercises,
    modifiedExercises,
    allChanges,
    originalSession: original.toPOJO(),
    newSession: modified.toPOJO(),
  };
}

// ============================================================================
// Filter Diff by Selected Changes
// ============================================================================

/**
 * Creates a subset diff containing only the selected changes.
 *
 * @param diff The complete diff
 * @param selectedChangeIds Set of change IDs to include
 * @returns A new SessionBlueprintDiff with only the selected changes
 */
export function filterDiff(
  diff: SessionBlueprintDiff,
  selectedChangeIds: Set<string>,
): SessionBlueprintDiff {
  const sessionChanges = diff.sessionChanges.filter((c) =>
    selectedChangeIds.has(c.id),
  );
  const addedExercises = diff.addedExercises.filter((c) =>
    selectedChangeIds.has(c.id),
  );
  const removedExercises = diff.removedExercises.filter((c) =>
    selectedChangeIds.has(c.id),
  );
  const reorderedExercises = diff.reorderedExercises.filter((c) =>
    selectedChangeIds.has(c.id),
  );
  const modifiedExercises = diff.modifiedExercises
    .map((mod) => ({
      ...mod,
      changes: mod.changes.filter((c) => selectedChangeIds.has(c.id)),
    }))
    .filter((mod) => mod.changes.length > 0);

  const allChanges = diff.allChanges.filter((c) => selectedChangeIds.has(c.id));

  return {
    hasChanges: allChanges.length > 0,
    sessionChanges,
    addedExercises,
    removedExercises,
    reorderedExercises,
    modifiedExercises,
    allChanges,
    originalSession: diff.originalSession,
    newSession: diff.newSession,
  };
}

// ============================================================================
// Apply Selected Changes
// ============================================================================

/**
 * Applies a diff to create a new SessionBlueprint.
 *
 * @param original The original SessionBlueprint
 * @param modified The modified SessionBlueprint (source of changes)
 * @param diff The computed diff
 * @returns A new SessionBlueprint with only selected changes applied
 */
export function applySessionBlueprintDiff(
  original: SessionBlueprint,
  diff: SessionBlueprintDiff,
): SessionBlueprint {
  let name = original.name;
  let notes = original.notes;

  // Apply session-level changes
  for (const change of diff.sessionChanges) {
    match(change)
      .with({ kind: 'sessionName' }, (c) => {
        name = c.newValue;
      })
      .with({ kind: 'sessionNotes' }, (c) => {
        notes = c.newValue;
      })
      .exhaustive();
  }

  // Build the exercise list
  // Start with a copy of original exercises
  const exercises: ExerciseBlueprint[] = [...original.exercises];

  // Track indices to remove (we'll remove them at the end to preserve indices)
  const indicesToRemove = new Set<number>();

  // Track exercises to add (with their target indices)
  const exercisesToAdd: ExerciseWithIndex[] = [];

  // Apply removed exercises
  for (const change of diff.removedExercises) {
    indicesToRemove.add(change.oldIndex);
  }

  // Apply added exercises
  for (const change of diff.addedExercises) {
    exercisesToAdd.push({
      exercise: change.exercise,
      index: change.newIndex,
    });
  }

  // Apply field-level modifications
  for (const mod of diff.modifiedExercises) {
    // Find the corresponding original index
    const originalIdx = original.exercises.findIndex(
      (ex) => ex.name === mod.exerciseName,
    );

    if (originalIdx === -1) continue;

    let exercise = exercises[originalIdx];

    for (const change of mod.changes) {
      exercise = match(change)
        .with({ kind: 'exerciseName' }, (c) =>
          exercise.with({ name: c.newValue }),
        )
        .with({ kind: 'exerciseSets' }, (c) =>
          exercise instanceof WeightedExerciseBlueprint
            ? exercise.with({ sets: c.newValue })
            : exercise,
        )
        .with({ kind: 'exerciseReps' }, (c) =>
          exercise instanceof WeightedExerciseBlueprint
            ? exercise.with({ repsPerSet: c.newValue })
            : exercise,
        )
        .with({ kind: 'exerciseWeightIncrease' }, (c) =>
          exercise instanceof WeightedExerciseBlueprint
            ? exercise.with({ weightIncreaseOnSuccess: c.newValue })
            : exercise,
        )
        .with({ kind: 'exerciseRest' }, (c) =>
          exercise instanceof WeightedExerciseBlueprint
            ? exercise.with({ restBetweenSets: c.newValue })
            : exercise,
        )
        .with({ kind: 'exerciseSuperset' }, (c) =>
          exercise instanceof WeightedExerciseBlueprint
            ? exercise.with({ supersetWithNext: c.newValue })
            : exercise,
        )
        .with({ kind: 'exerciseNotes' }, (c) =>
          exercise.with({ notes: c.newValue }),
        )
        .with({ kind: 'exerciseLink' }, (c) =>
          exercise.with({ link: c.newValue }),
        )
        .with({ kind: 'exerciseTarget' }, (c) =>
          exercise instanceof CardioExerciseBlueprint
            ? exercise.with({ target: c.newValue })
            : exercise,
        )
        .with({ kind: 'exerciseTracking' }, (c) =>
          exercise instanceof CardioExerciseBlueprint
            ? exercise.with({ [c.field]: c.newValue })
            : exercise,
        )
        .with({ kind: 'exerciseType' }, (c) => c.newExercise)
        .exhaustive();
    }

    exercises[originalIdx] = exercise;
  }

  // Apply reordering if selected
  // Note: Reordering is complex when combined with add/remove.
  // For now, we apply reordering based on the target positions from modified.
  const reorderChanges = diff.reorderedExercises;

  // Remove exercises marked for removal
  const finalExercises = exercises.filter(
    (_, idx) => !indicesToRemove.has(idx),
  );

  // Add new exercises at their target positions
  // Sort by index to insert in correct order
  exercisesToAdd.sort((a, b) => a.index - b.index);
  for (const { exercise, index } of exercisesToAdd) {
    // Clamp index to valid range
    const insertIdx = Math.min(index, finalExercises.length);
    finalExercises.splice(insertIdx, 0, exercise);
  }

  // Apply reordering
  if (reorderChanges.length > 0) {
    // Create a map of exercise name to current index
    const nameToCurrentIdx = new Map<string, number>();
    finalExercises.forEach((ex, idx) => {
      // Only map first occurrence for duplicates
      if (!nameToCurrentIdx.has(ex.name)) {
        nameToCurrentIdx.set(ex.name, idx);
      }
    });

    // Sort reorder changes by target index
    const sortedReorders = [...reorderChanges].sort(
      (a, b) => a.newIndex - b.newIndex,
    );

    // Apply reorders (this is a simplified approach)
    for (const reorder of sortedReorders) {
      const currentIdx = nameToCurrentIdx.get(reorder.exerciseName);
      if (currentIdx !== undefined && currentIdx !== reorder.newIndex) {
        const [exercise] = finalExercises.splice(currentIdx, 1);
        const targetIdx = Math.min(reorder.newIndex, finalExercises.length);
        finalExercises.splice(targetIdx, 0, exercise);

        // Update the map
        finalExercises.forEach((ex, idx) => {
          nameToCurrentIdx.set(ex.name, idx);
        });
      }
    }
  }

  return new SessionBlueprint(name, finalExercises, notes);
}

// ============================================================================
// Utility Functions
// ============================================================================

// ============================================================================
// Translation Key Types
// ============================================================================

/**
 * Represents a translatable string with its key and interpolation parameters.
 * Components should use this with their t() function to get the localized string.
 */
export interface TranslatableString {
  key: TranslationKey;
  params?: Record<string, string | number>;
}

/**
 * Get the translation key and parameters for describing a change.
 * Use with t(result.key, result.params) in your component.
 */
export function getChangeDescription(change: DiffChange): TranslatableString {
  return match(change)
    .returnType<TranslatableString>()
    .with({ kind: 'sessionName' }, (c) => ({
      key: 'plan.diff.generic_two_value_change.body',
      params: { oldValue: c.oldValue, newValue: c.newValue },
    }))
    .with({ kind: 'sessionNotes' }, () => ({
      key: 'plan.diff.generic_updated.body',
    }))
    .with({ kind: 'exercise', type: 'added' }, (c) => ({
      key: 'plan.diff.exercise_added.body',
      params: { name: c.exercise.name },
    }))
    .with({ kind: 'exercise', type: 'removed' }, (c) => ({
      key: 'plan.diff.exercise_removed.body',
      params: { name: c.exercise.name },
    }))
    .with({ kind: 'exercise', type: 'reordered' }, (c) => ({
      key: 'plan.diff.exercise_reordered.body',
      params: {
        name: c.exerciseName,
        oldPosition: c.oldIndex + 1,
        newPosition: c.newIndex + 1,
      },
    }))
    .with({ kind: 'exerciseName' }, (c) => ({
      key: 'plan.diff.generic_two_value_change.body',
      params: { oldValue: c.oldValue, newValue: c.newValue },
    }))
    .with({ kind: 'exerciseSets' }, (c) => ({
      key: 'plan.diff.generic_two_value_change.body',
      params: { oldValue: c.oldValue, newValue: c.newValue },
    }))
    .with({ kind: 'exerciseReps' }, (c) => ({
      key: 'plan.diff.generic_two_value_change.body',
      params: { oldValue: c.oldValue, newValue: c.newValue },
    }))
    .with({ kind: 'exerciseWeightIncrease' }, (c) => ({
      key: 'plan.diff.generic_two_value_change.body',
      params: {
        oldValue: c.oldValue.toString(),
        newValue: c.newValue.toString(),
      },
    }))
    .with({ kind: 'exerciseRest' }, () => ({
      key: 'plan.diff.generic_updated.body',
    }))
    .with({ kind: 'exerciseSuperset' }, (c) => ({
      key: c.newValue
        ? 'plan.diff.generic_enabled.body'
        : 'plan.diff.generic_disabled.body',
    }))
    .with({ kind: 'exerciseNotes' }, () => ({
      key: 'plan.diff.generic_updated.body',
    }))
    .with({ kind: 'exerciseLink' }, () => ({
      key: 'plan.diff.generic_updated.body',
    }))
    .with({ kind: 'exerciseTarget' }, () => ({
      key: 'plan.diff.generic_updated.body',
    }))
    .with({ kind: 'exerciseTracking' }, (c) => ({
      key: c.newValue
        ? 'plan.diff.generic_enabled.body'
        : 'plan.diff.generic_disabled.body',
    }))
    .with({ kind: 'exerciseType' }, (c) => ({
      key: 'plan.diff.generic_two_value_change.body',
      params: {
        oldValue:
          c.oldExercise instanceof WeightedExerciseBlueprint
            ? 'weighted'
            : 'cardio',
        newValue:
          c.newExercise instanceof WeightedExerciseBlueprint
            ? 'weighted'
            : 'cardio',
      },
    }))
    .exhaustive();
}

/**
 * Get a short label translation key for a change (for compact UI).
 * Use with t(result.key, result.params) in your component.
 */
export function getChangeLabelKey(change: DiffChange): TranslatableString {
  return match(change)
    .returnType<TranslatableString>()
    .with({ kind: 'sessionName' }, () => ({
      key: 'plan.diff.session_name.label',
    }))
    .with({ kind: 'sessionNotes' }, () => ({
      key: 'plan.diff.session_notes.label',
    }))
    .with({ kind: 'exercise', type: 'added' }, (c) => ({
      key: 'plan.diff.exercise_added.label',
      params: { name: c.exercise.name },
    }))
    .with({ kind: 'exercise', type: 'removed' }, (c) => ({
      key: 'plan.diff.exercise_removed.label',
      params: { name: c.exercise.name },
    }))
    .with({ kind: 'exercise', type: 'reordered' }, (c) => ({
      key: 'plan.diff.exercise_reordered.label',
      params: { name: c.exerciseName },
    }))
    .with({ kind: 'exerciseName' }, () => ({
      key: 'plan.diff.name.label',
    }))
    .with({ kind: 'exerciseSets' }, () => ({
      key: 'plan.diff.sets.label',
    }))
    .with({ kind: 'exerciseReps' }, () => ({
      key: 'plan.diff.reps.label',
    }))
    .with({ kind: 'exerciseWeightIncrease' }, () => ({
      key: 'plan.diff.progressive_overload.label',
    }))
    .with({ kind: 'exerciseRest' }, () => ({
      key: 'plan.diff.rest.label',
    }))
    .with({ kind: 'exerciseSuperset' }, () => ({
      key: 'plan.diff.superset.label',
    }))
    .with({ kind: 'exerciseNotes' }, () => ({
      key: 'plan.diff.notes.label',
    }))
    .with({ kind: 'exerciseLink' }, () => ({
      key: 'plan.diff.link.label',
    }))
    .with({ kind: 'exerciseTarget' }, () => ({
      key: 'plan.diff.target.label',
    }))
    .with({ kind: 'exerciseTracking' }, (c) => ({
      key: `plan.diff.${c.field.replace('track', 'track_').toLowerCase()}.label` as TranslationKey,
    }))
    .with({ kind: 'exerciseType' }, () => ({
      key: 'plan.diff.exercise_type.label',
    }))
    .exhaustive();
}
