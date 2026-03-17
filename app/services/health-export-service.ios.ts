import { isNotNullOrUndefined } from '@/utils/null';
import { HealthExportService as HES } from './health-export-service-shared';
import {
  RecordedCardioExercise,
  RecordedExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { convert } from '@js-joda/core';
import {
  isHealthDataAvailable,
  QuantitySampleForSaving,
  requestAuthorization,
  saveQuantitySample,
  saveWorkoutSample,
  deleteObjects,
  WorkoutActivityType,
  ComparisonPredicateOperator,
  authorizationStatusFor,
  AuthorizationStatus,
} from '@kingstinct/react-native-healthkit';
import { match, P } from 'ts-pattern';
import { WeightUnit } from '@/models/weight';

export class HealthExportService implements HES {
  canExport() {
    return isHealthDataAvailable();
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    if (!this.canExport()) {
      return;
    }

    const { canShareBodyweight, canShareWorkout } =
      await this.requestPermissionInternal();

    if (canShareBodyweight) {
      await deleteObjects('HKQuantityTypeIdentifierBodyMass', {
        metadata: {
          withMetadataKey: 'workoutId',
          operatorType: ComparisonPredicateOperator.equalTo,
          value: workoutId,
        },
      });
    }
    if (canShareWorkout) {
      await deleteObjects('HKWorkoutTypeIdentifier', {
        metadata: {
          withMetadataKey: 'workoutId',
          operatorType: ComparisonPredicateOperator.equalTo,
          value: workoutId,
        },
      });
    }
  }

  async exportWorkout(workout: Session): Promise<void> {
    if (!this.canExport()) {
      return;
    }
    if (!workout.isStarted || !workout.firstExercise || !workout.lastExercise) {
      return;
    }
    const { canShareBodyweight, canShareWorkout } =
      await this.requestPermissionInternal();
    await this.deleteWorkout(workout.id);

    if (
      workout.bodyweight &&
      workout.bodyweight.unit !== 'nil' &&
      canShareBodyweight
    ) {
      await saveQuantitySample(
        'HKQuantityTypeIdentifierBodyMass',
        toHealthKitUnit(workout.bodyweight.unit),
        workout.bodyweight.value.toNumber(),
        convert(workout.lastExercise.latestTime!.toLocalDateTime()).toDate(),
        convert(workout.lastExercise.latestTime!.toLocalDateTime()).toDate(),
        {
          workoutId: workout.id,
        },
      );
    }

    if (canShareWorkout) {
      const exerciseQuantities = workout.recordedExercises
        .filter((x) => x.isStarted)
        .map(toQuantitySampleForSaving)
        .filter(isNotNullOrUndefined);
      await saveWorkoutSample(
        WorkoutActivityType.functionalStrengthTraining,
        exerciseQuantities,
        convert(workout.firstExercise.earliestTime!.toLocalDateTime()).toDate(),
        convert(workout.lastExercise.latestTime!.toLocalDateTime()).toDate(),
        {
          energyBurned: calculateEnergyBurnedKcal(workout),
        },
        {
          workoutId: workout.id,
          title: workout.blueprint.name,
        },
      );
    }
  }

  async requestPermission(): Promise<void> {
    await this.requestPermissionInternal();
  }

  private async requestPermissionInternal() {
    await requestAuthorization({
      toShare: ['HKWorkoutTypeIdentifier', 'HKQuantityTypeIdentifierBodyMass'],
    });

    return {
      canShareBodyweight:
        authorizationStatusFor('HKQuantityTypeIdentifierBodyMass') ===
        AuthorizationStatus.sharingAuthorized,
      canShareWorkout:
        authorizationStatusFor('HKWorkoutTypeIdentifier') ===
        AuthorizationStatus.sharingAuthorized,
    };
  }
}

function toQuantitySampleForSaving(
  exercise: RecordedExercise,
): QuantitySampleForSaving | undefined {
  return match(exercise)
    .with(
      P.instanceOf(RecordedWeightedExercise),
      toWeightedQuantitySampleForSaving,
    )
    .with(
      P.instanceOf(RecordedCardioExercise),
      toCardioExerciseQuantitySampleForSaving,
    )
    .exhaustive();
}

function toWeightedQuantitySampleForSaving(
  exercise: RecordedWeightedExercise,
): QuantitySampleForSaving | undefined {
  return undefined;
}

// There's a world where we do heuristics or otherwise to match to apple types
function toCardioExerciseQuantitySampleForSaving(
  exercise: RecordedCardioExercise,
): QuantitySampleForSaving | undefined {
  return undefined;
}

function toHealthKitUnit(unit: Exclude<WeightUnit, 'nil'>): 'lb' | 'kg' {
  return match(unit)
    .with('kilograms', () => 'kg' as const)
    .with('pounds', () => 'lb' as const)
    .exhaustive();
}

function calculateEnergyBurnedKcal(workout: Session): number {
  const MET_STRENGTH_TRAINING = 3.5;
  const DEFAULT_BODYWEIGHT_KG = 70;

  const duration = workout.duration;
  if (!duration) return 0;

  const durationHours = duration.toMinutes() / 60;

  let bodyweightKg = DEFAULT_BODYWEIGHT_KG;
  if (workout.bodyweight && workout.bodyweight.unit !== 'nil') {
    bodyweightKg = workout.bodyweight.convertTo('kilograms').value.toNumber();
  }

  return MET_STRENGTH_TRAINING * bodyweightKg * durationHours;
}
