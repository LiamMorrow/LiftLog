import Button from '@/components/presentation/foundation/button';
import { ColorSliders } from '@/components/presentation/foundation/editors/color-sliders';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ColorSchemeSeed } from '@/store/settings';
import { type HexColor } from '@/utils/color';
import { createMaterial3Theme } from '@pchmn/expo-material3-theme';
import { T } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';

interface ColorPickerDialogProps {
  open: boolean;
  onClose: () => void;
  initialSeed: ColorSchemeSeed;
  onConfirm: (seed: HexColor) => void;
}

export default function ColorPickerDialog(props: ColorPickerDialogProps) {
  const { colors } = useAppTheme();
  const fallback = colors.primary as HexColor;
  const [draft, setDraft] = useState<HexColor>(props.initialSeed === 'default' ? fallback : props.initialSeed);

  useEffect(() => {
    if (props.open) {
      setDraft(props.initialSeed === 'default' ? fallback : props.initialSeed);
    }
    // Only reset when the dialog is (re)opened, not on every theme tick.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  if (!props.open) {
    return null;
  }

  return (
    <Portal>
      <Dialog visible={props.open} onDismiss={props.onClose}>
        <Dialog.Title>
          <T keyName="settings.theme.custom.title" />
        </Dialog.Title>
        <Dialog.Content>
          <View style={{ gap: spacing[5] }}>
            <ColorSliders value={draft} onChange={setDraft} />
            <PalettePreview seed={draft} />
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={props.onClose} testID="color-picker-close">
            <T keyName="generic.close.button" />
          </Button>
          <Button
            testID="color-picker-save"
            onPress={() => {
              props.onConfirm(draft);
              props.onClose();
            }}
          >
            <T keyName="generic.save.button" />
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

/** Shows the palette the seed generates, so its effect is visible before committing. */
function PalettePreview({ seed }: { seed: HexColor }) {
  const { colors, colorScheme } = useAppTheme();
  const scheme = createMaterial3Theme(seed)[colorScheme];
  const swatches = [
    scheme.primary,
    scheme.secondary,
    scheme.tertiary,
    scheme.primaryContainer,
    scheme.secondaryContainer,
    scheme.tertiaryContainer,
  ];

  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainer,
        borderRadius: spacing[3],
        padding: spacing[4],
        gap: spacing[3],
      }}
    >
      <SurfaceText font="text-sm" weight="600" color="onSurfaceVariant">
        <T keyName="settings.theme.custom.preview" />
      </SurfaceText>
      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        {swatches.map((color, i) => (
          <View key={i} style={{ flex: 1, height: spacing[10], borderRadius: spacing[2], backgroundColor: color }} />
        ))}
      </View>
    </View>
  );
}
