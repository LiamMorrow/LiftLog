import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { NativeIconButton } from '@/components/foundation/native-icon-button';
import { RepsSegment } from '@/components/workout/reps-strip';
import { NativeButton } from '@/components/foundation/native-button';
import RemoveIcon from '@expo/material-symbols/remove.xml';
import AddIcon from '@expo/material-symbols/add.xml';
import CloseIcon from '@expo/material-symbols/close.xml';
import { NumberInput } from '@/components/foundation/editors/number-inputs';
import { useDerivedState } from '@/hooks/useDerivedState';
import { useIsLandscape } from '@/hooks/useWindowLayout';

const quickRepsPerRow = 7;
const maxQuickRepsRows = 4;

export function RepsEditor(props: {
  reps: number | undefined;
  repTarget: number;
  onChange: (reps: number | undefined) => void;
  onPick: (reps: number) => void;
}) {
  const { t } = useTranslate();
  const isLandscape = useIsLandscape();
  const [text, setText] = useDerivedState(props.reps, (reps) => reps?.toString() ?? '');

  const changeText = (next: string) => {
    setText(next);
    const trimmed = next.trim();
    if (trimmed === '') {
      props.onChange(undefined);
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isInteger(parsed) && parsed >= 0) {
      props.onChange(parsed);
    }
  };
  const step = (by: number) =>
    props.onChange(props.reps === undefined ? props.repTarget : Math.max(0, props.reps + by));

  return (
    <View style={{ gap: spacing[4] }}>
      {isLandscape ? undefined : <QuickReps reps={props.reps} repTarget={props.repTarget} onPick={props.onPick} />}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
        <NativeIconButton
          icon={RemoveIcon}
          systemImage="minus"
          variant="tonal"
          iconSize={28}
          testID="decrement-reps"
          label={t('generic.decrease.button')}
          onPress={() => step(-1)}
        />
        <NumberInput
          testID="reps-input"
          size="large"
          autoFocus
          value={text}
          onChangeText={changeText}
          placeholder={props.repTarget.toString()}
          keyboardType="number-pad"
          accessibilityLabel={t('exercise.reps.label')}
          flex={1}
        />
        <NativeIconButton
          icon={AddIcon}
          systemImage="plus"
          variant="tonal"
          iconSize={28}
          testID="increment-reps"
          label={t('generic.increase.button')}
          onPress={() => step(1)}
        />
      </View>
    </View>
  );
}

function QuickReps(props: { reps: number | undefined; repTarget: number; onPick: (reps: number) => void }) {
  const rowsToReachTarget = Math.ceil((props.repTarget + 4) / quickRepsPerRow);
  const rowCount = Math.min(rowsToReachTarget, maxQuickRepsRows);
  const firstCount = (rowsToReachTarget - rowCount) * quickRepsPerRow;
  const lastRow = rowCount - 1;
  const lastColumn = quickRepsPerRow - 1;
  return (
    <View style={{ gap: spacing[0.5] }}>
      {Array.from({ length: rowCount }, (_, row) => (
        <View key={row} style={{ flexDirection: 'row', gap: spacing[0.5] }}>
          {Array.from({ length: quickRepsPerRow }, (_, column) => {
            const reps = firstCount + row * quickRepsPerRow + column;
            return (
              <RepsSegment
                key={column}
                testID={`quick-reps-${reps}`}
                set={{ label: reps.toString(), isDone: reps === props.reps }}
                highlighted={reps === props.repTarget}
                roundedCorners={{
                  topStart: row === 0 && column === 0,
                  topEnd: row === 0 && column === lastColumn,
                  bottomEnd: row === lastRow && column === lastColumn,
                  bottomStart: row === lastRow && column === 0,
                }}
                onPress={() => props.onPick(reps)}
                style={{ flex: 1, minWidth: 0, height: spacing[11] }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function ClearRepsButton(props: { onPress: () => void }) {
  const { t } = useTranslate();
  return (
    <NativeButton
      icon={CloseIcon}
      systemImage="xmark"
      variant="error"
      testID="clear-reps"
      label={t('generic.clear.button')}
      onPress={props.onPress}
    />
  );
}
