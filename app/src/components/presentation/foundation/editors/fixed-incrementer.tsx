import { IntegerInput } from '@/components/presentation/foundation/editors/number-inputs';
import IconButton from '@/components/presentation/foundation/icon-button';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { useAppTheme, spacing, rounding } from '@/hooks/useAppTheme';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { match } from 'ts-pattern';

interface FixedIncrementerProps {
  value: number;
  label: string;
  onValueChange: (value: number) => void;
  testID?: string;
}

export default function FixedIncrementer(props: FixedIncrementerProps) {
  const { colors } = useAppTheme();
  const betweenRadius = rounding.segmentedBetweenRadius;
  const capRadius = 10;

  return (
    <View
      testID={props.testID}
      style={{
        gap: spacing[0.5],
        justifyContent: 'center',
      }}
    >
      <AppText
        variant="labelLarge"
        style={{
          textAlign: 'center',
        }}
      >
        {props.label}
      </AppText>

      <View
        style={{
          borderTopStartRadius: capRadius,
          borderTopEndRadius: capRadius,
          borderBottomStartRadius: betweenRadius,
          borderBottomEndRadius: betweenRadius,
          backgroundColor: colors.surfaceVariant,
          overflow: 'hidden',
        }}
      >
        <IntegerInput
          onChange={props.onValueChange}
          value={props.value}
          accessibilityLabel={props.label}
          testID="fixed-value-input"
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: spacing[0.5],
        }}
      >
        <ContainedSegmentIconButton
          icon={'remove'}
          onPress={() => props.onValueChange(props.value - 1)}
          position="start"
          testID="fixed-decrement"
        />
        <ContainedSegmentIconButton
          icon={'add'}
          onPress={() => props.onValueChange(props.value + 1)}
          position="end"
          testID="fixed-increment"
        />
      </View>
    </View>
  );
}

interface ContainedSegmentIconButtonProps {
  position: 'start' | 'end' | 'middle';
  icon: AppIconSource;
  onPress: () => void;
  testID?: string;
}
function ContainedSegmentIconButton(props: ContainedSegmentIconButtonProps) {
  const { colors } = useAppTheme();
  const betweenRadius = rounding.segmentedBetweenRadius;
  const capRadius = 10;
  const radius = match(props.position)
    .with('start', () => ({
      borderTopStartRadius: betweenRadius,
      borderTopEndRadius: betweenRadius,
      borderBottomStartRadius: capRadius,
      borderBottomEndRadius: betweenRadius,
    }))
    .with('middle', () => ({
      borderTopStartRadius: betweenRadius,
      borderTopEndRadius: betweenRadius,
      borderBottomStartRadius: betweenRadius,
      borderBottomEndRadius: betweenRadius,
    }))
    .with('end', () => ({
      borderTopStartRadius: betweenRadius,
      borderTopEndRadius: betweenRadius,
      borderBottomStartRadius: betweenRadius,
      borderBottomEndRadius: capRadius,
    }))
    .exhaustive();
  return (
    <IconButton
      testID={props.testID}
      mode="contained-tonal"
      icon={props.icon}
      onPress={props.onPress}
      iconColor={colors.onSurfaceVariant}
      style={[
        radius,
        {
          margin: 0,
          backgroundColor: colors.surfaceVariant,
          flex: 1,
        },
      ]}
    />
  );
}
