import { Platform } from 'react-native';
import { HealthExportService as HES } from './health-export-service-shared';
import { RecordedCardioExercise, RecordedExercise, RecordedWeightedExercise, Session } from '@/models/session-models';
import {
  initialize,
  requestPermission,
  getGrantedPermissions,
  ExerciseSegmentType,
  ExerciseSessionRecord,
  ExerciseType,
  insertRecords,
  deleteRecordsByUuids,
} from 'react-native-health-connect';
import { match, P } from 'ts-pattern';
import type { ExerciseSegment } from 'react-native-health-connect/lib/typescript/types/base.types';

export class HealthExportService implements HES {
  canExport() {
    if (Platform.OS !== 'android' || Platform.Version < 26) {
      return false;
    }
    return true;
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    if (!this.canExport()) {
      return;
    }
    const grantedPermissions = await this.getGrantedPermissionsInternal();
    if (grantedPermissions.some((x) => x.accessType === 'write' && x.recordType === 'Weight')) {
      await deleteRecordsByUuids('Weight', [], [workoutId]);
    }
    if (grantedPermissions.some((x) => x.accessType === 'write' && x.recordType === 'ExerciseSession')) {
      await deleteRecordsByUuids('ExerciseSession', [], [workoutId]);
    }
  }

  async exportWorkout(workout: Session): Promise<void> {
    if (!this.canExport()) {
      return;
    }
    if (!workout.isStarted || !workout.firstExercise || !workout.lastExercise) {
      return;
    }

    // Non-interactive on purpose: the permission activity round-trip can hang or die when the
    // app backgrounds right after a workout. The interactive request runs from the settings toggle.
    const grantedPermissions = await this.getGrantedPermissionsInternal();

    const exerciseSegments = workout.recordedExercises.filter((x) => x.isStarted).map(toExerciseSegment);
    const exerciseSessionRecord: ExerciseSessionRecord = {
      metadata: {
        clientRecordId: workout.id,
      },
      recordType: 'ExerciseSession',
      exerciseType: ExerciseType.WEIGHTLIFTING,
      segments: exerciseSegments,
      startTime: workout.firstExercise.earliestTime!.toString(),
      endTime: workout.lastExercise.latestTime!.toString(),
      title: workout.blueprint.name,
    };
    if (grantedPermissions.some((x) => x.accessType === 'write' && x.recordType === 'ExerciseSession')) {
      await insertRecords([exerciseSessionRecord]);
    }
    if (
      workout.bodyweight &&
      workout.bodyweight.unit !== 'nil' &&
      grantedPermissions.some((x) => x.accessType === 'write' && x.recordType === 'Weight')
    ) {
      await insertRecords([
        {
          metadata: {
            clientRecordId: workout.id,
          },
          recordType: 'Weight',
          time: workout.lastExercise.latestTime!.toString(),
          weight: {
            unit: workout.bodyweight.unit,
            value: workout.bodyweight.value.toNumber(),
          },
        },
      ]);
    }
  }

  async requestPermission(): Promise<void> {
    await this.requestPermissionInternal();
  }

  private async requestPermissionInternal() {
    await initialize();

    return await requestPermission([
      { accessType: 'write', recordType: 'Weight' },
      { accessType: 'write', recordType: 'ExerciseSession' },
    ]);
  }

  private async getGrantedPermissionsInternal() {
    await initialize();

    return await getGrantedPermissions();
  }
}

function toExerciseSegment(exercise: RecordedExercise): ExerciseSegment {
  return match(exercise)
    .with(P.instanceOf(RecordedWeightedExercise), toWeightedExerciseSegment)
    .with(P.instanceOf(RecordedCardioExercise), toCardioExerciseSegment)
    .exhaustive();
}

function toWeightedExerciseSegment(exercise: RecordedWeightedExercise): ExerciseSegment {
  return {
    segmentType: ExerciseSegmentType.WEIGHTLIFTING,
    startTime: exercise.earliestTime!.toString(),
    endTime: exercise.latestTime!.toString(),
    repetitions: exercise.potentialSets.reduce((a, b) => a + (b.set?.repsCompleted ?? 0), 0),
  };
}

function toCardioExerciseSegment(exercise: RecordedCardioExercise): ExerciseSegment {
  return {
    segmentType: ExerciseSegmentType.OTHER_WORKOUT,
    startTime: exercise.earliestTime!.toString(),
    endTime: exercise.latestTime!.toString(),
    repetitions: exercise.sets.reduce((a, b) => a + (b.completionDateTime ? 1 : 0), 0),
  };
}
