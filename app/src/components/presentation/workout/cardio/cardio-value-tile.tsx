import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { font, rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { T } from '@tolgee/react';
import { ReactNode, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Portal, Dialog, Text } from 'react-native-paper';
import TouchableRipple from '@/components/presentation/foundation/gesture-wrappers/touchable-ripple';

const emptyDisplay = '-';

interface CardioValueTileProps<T> {
  value: T | undefined;
  /** Seeds the editor when an empty tile is opened. */
  emptyValue: T;
  format: (value: T) => string;
  label: string;
  onSave: (value: T) => void;
  children: (value: T, setValue: (value: T) => void) => ReactNode;
  dialogStyle?: ViewStyle;
  testID?: string;
}

export function CardioValueTile<T>({
  value,
  emptyValue,
  format,
  label,
  onSave,
  children,
  dialogStyle,
  testID,
}: CardioValueTileProps<T>) {
  const { colors } = useAppTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogValue, setDialogValue] = useState<T>(value ?? emptyValue);
  const filled = value !== undefined;

  // The seed colour is the user's and can land anywhere on the wheel, so filled and empty are
  // separated by a tonal step rather than by hue.
  return (
    <View style={{ borderRadius: rounding.roundedRectangleRadius, overflow: 'hidden' }}>
      <TouchableRipple
        testID={testID}
        onPress={() => {
          setDialogValue(value ?? emptyValue);
          setDialogOpen(true);
        }}
        style={[
          styles.tile,
          { backgroundColor: filled ? colors.secondaryContainer : colors.surfaceContainerHighest },
        ]}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.value, { color: filled ? colors.onSecondaryContainer : colors.outline }]}>
            {filled ? format(value) : emptyDisplay}
          </Text>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>{label}</Text>
        </View>
      </TouchableRipple>
      {dialogOpen && (
        <Portal>
          <KeyboardAvoidingView behavior={'height'} style={{ flex: 1, pointerEvents: 'box-none' }}>
            <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
              <Dialog.Title>{label}</Dialog.Title>
              <Dialog.Content style={[{ flexDirection: 'row', alignItems: 'center' }, dialogStyle]}>
                {children(dialogValue, setDialogValue)}
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setDialogOpen(false)}>
                  <T keyName="generic.cancel.button" />
                </Button>
                <Button
                  testID="cardio-value-save"
                  onPress={() => {
                    setDialogOpen(false);
                    onSave(dialogValue);
                  }}
                >
                  <T keyName="generic.save.button" />
                </Button>
              </Dialog.Actions>
            </Dialog>
          </KeyboardAvoidingView>
        </Portal>
      )}
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
