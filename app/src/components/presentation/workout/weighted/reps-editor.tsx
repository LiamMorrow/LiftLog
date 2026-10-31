import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import IconButton from '@/components/presentation/foundation/icon-button';
import { NumberInput } from '@/components/presentation/foundation/editors/number-inputs';
import { useDerivedState } from '@/hooks/useDerivedState';

export function RepsEditor(props: {
  reps: number | undefined;
  repTarget: number;
  onChange: (reps: number | undefined) => void;
}) {
  const { t } = useTranslate();
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
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
      <IconButton
        icon="minus"
        mode="contained-tonal"
        size={28}
        testID="decrement-reps"
        accessibilityLabel={t('generic.decrease.button')}
        onPress={() => step(-1)}
      />
      <NumberInput
        testID="reps-input"
        size="large"
        autoFocus
        value={text}
        onChangeText={changeText}
        keyboardType="number-pad"
        accessibilityLabel={t('exercise.reps.label')}
        flex={1}
      />
      <IconButton
        icon="plus"
        mode="contained-tonal"
        size={28}
        testID="increment-reps"
        accessibilityLabel={t('generic.increase.button')}
        onPress={() => step(1)}
      />
    </View>
  );
}
