import { useAppTheme } from '@/hooks/useAppTheme';
import { RecordedExercise } from '@/models/session-models';
import { DatedRecordedExercise } from '@/models/stats-models';
import { View } from 'react-native';

interface WeightedExerciseProps {
  recordedExercise: RecordedExercise;
  previousRecordedExercises: DatedRecordedExercise[];
  toStartNext: boolean;
  isReadonly: boolean;
  showPreviousButton: boolean;
}

export default function WeightedExercise() {
  const { colors, spacing } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'column',
        gap: spacing[4],
        paddingBlock: spacing[4],
        paddingLeft: spacing[7],
        paddingRight: spacing[2],
        width: '100%',
      }}
      data-cy="weighted-exercise"
    >
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        ></View>
      </View>
    </View>
  );
}
