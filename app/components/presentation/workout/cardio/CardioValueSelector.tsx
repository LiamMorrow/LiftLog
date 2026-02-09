import { CardioTrackerCard } from '@/components/presentation/workout/cardio/CardioTrackerCard';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { useAppTheme, font } from '@/hooks/useAppTheme';
import { T } from '@tolgee/react';
import { ReactNode, useState } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Portal, Dialog, Text } from 'react-native-paper';

export function CardioValueSelector(props: {
  children: ReactNode;
  buttonText: string;
  label: string;
  onSave: () => void;
  onButtonPress: () => void;
  onHold: () => void;
  style?: ViewStyle;
}) {
  const { buttonText, children, label, onButtonPress, onHold, onSave } = props;
  const { colors } = useAppTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <CardioTrackerCard onHold={onHold}>
      <Button
        mode="text"
        labelStyle={font['text-xl']}
        onPress={() => {
          onButtonPress();
          setDialogOpen(true);
        }}
      >
        {buttonText}
      </Button>
      <Text style={[styles.bigText, { color: colors.onSecondaryContainer }]}>
        {label}
      </Text>
      <Portal>
        <KeyboardAvoidingView
          behavior={'height'}
          style={{ flex: 1, pointerEvents: dialogOpen ? 'box-none' : 'none' }}
        >
          <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
            <Dialog.Title>{label}</Dialog.Title>
            <Dialog.Content
              style={[
                { flexDirection: 'row', alignItems: 'center' },
                props.style,
              ]}
            >
              {children}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogOpen(false)}>
                <T keyName="generic.cancel.button" />
              </Button>
              <Button
                onPress={() => {
                  setDialogOpen(false);
                  onSave();
                }}
              >
                <T keyName="generic.save.button" />
              </Button>
            </Dialog.Actions>
          </Dialog>
        </KeyboardAvoidingView>
      </Portal>
    </CardioTrackerCard>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    ...font['text-xl'],
  },
});
