import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import { NativeButton } from '@/components/presentation/foundation/native-button';
import RemoveIcon from '@expo/material-symbols/remove.xml';
import AddIcon from '@expo/material-symbols/add.xml';
import CloseIcon from '@expo/material-symbols/close.xml';
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
  );
}

export function ClearRepsButton(props: { onPress: () => void }) {
  const { t } = useTranslate();
  return (
    <NativeButton
      icon={CloseIcon}
      systemImage="xmark"
      variant="tonal"
      floating
      testID="clear-reps"
      label={t('generic.clear.button')}
      onPress={props.onPress}
    />
  );
}
