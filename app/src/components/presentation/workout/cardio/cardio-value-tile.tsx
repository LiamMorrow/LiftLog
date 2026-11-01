import { font, rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { DockedEditor } from '@/components/presentation/workout/edit-dock';

const emptyDisplay = '-';

type CardioValueTileProps<T> = {
  value: T | undefined;
  format: (value: T) => string;
  label: string;
  editorStyle?: ViewStyle;
  editorSubtitle?: string;
  headerAction?: (value: T, setValue: (value: T) => void) => ReactNode;
  testID?: string;
} & (
  | {
      isReadonly: true;
      /** Seeds the editor when an empty tile is opened. */
      emptyValue?: T;
      onChange?: (value: T) => void;
      children?: (value: T, setValue: (value: T) => void) => ReactNode;
    }
  | {
      isReadonly?: false;
      emptyValue: T;
      onChange: (value: T) => void;
      children: (value: T, setValue: (value: T) => void) => ReactNode;
    }
);

export function CardioValueTile<T>({
  value,
  emptyValue,
  format,
  label,
  onChange,
  children,
  editorStyle,
  editorSubtitle,
  headerAction,
  testID,
  isReadonly,
}: CardioValueTileProps<T>) {
  const { colors } = useAppTheme();
  const [editorOpen, setEditorOpen] = useState(false);
  const editorValue = value ?? emptyValue;
  const setEditorValue = (next: T) => onChange?.(next);
  const filled = value !== undefined;

  const face = (
    <View style={{ alignItems: 'center' }}>
      <Text style={[styles.value, { color: filled ? colors.onSecondaryContainer : colors.outline }]}>
        {filled ? format(value) : emptyDisplay}
      </Text>
      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>{label}</Text>
    </View>
  );
  const tileStyle = [
    styles.tile,
    { backgroundColor: filled ? colors.secondaryContainer : colors.surfaceContainerHighest },
  ];

  // The seed colour is the user's and can land anywhere on the wheel, so filled and empty are
  // separated by a tonal step rather than by hue.
  return (
    <View>
      <View style={{ borderRadius: rounding.roundedRectangleRadius, overflow: 'hidden' }}>
        {isReadonly ? (
          <View testID={testID} style={tileStyle}>
            {face}
          </View>
        ) : (
          <TouchableRipple testID={testID} onPress={() => setEditorOpen(true)} style={tileStyle}>
            {face}
          </TouchableRipple>
        )}
      </View>
      {editorValue !== undefined ? (
        <DockedEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          title={label}
          subtitle={editorSubtitle}
          headerAction={headerAction?.(editorValue, setEditorValue)}
        >
          <View style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, editorStyle]}>
            {children?.(editorValue, setEditorValue)}
          </View>
        </DockedEditor>
      ) : undefined}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    minWidth: spacing[20],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    ...font['text-xl'],
  },
  label: {
    textAlign: 'center',
    ...font['text-xs'],
  },
});
