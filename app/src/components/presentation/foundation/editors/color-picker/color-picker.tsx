import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { NativeButton } from '@/components/presentation/foundation/native-button';
import { ColorSliders } from '@/components/presentation/foundation/editors/color-sliders';
import { AppText } from '@/components/presentation/foundation/app-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ColorSchemeSeed } from '@/store/settings';
import { type HexColor } from '@/utils/color';
import { createMaterial3Theme } from '@pchmn/expo-material3-theme';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, View } from 'react-native';

export function ColorPicker(props: { initialSeed: ColorSchemeSeed; onSave: (seed: HexColor) => void }) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const [draft, setDraft] = useState<HexColor>(
    props.initialSeed === 'default' ? (colors.primary as HexColor) : props.initialSeed,
  );
  const save = () => props.onSave(draft);

  return (
    <FullHeightScrollView modal>
      <Stack.Screen options={{ title: t('settings.theme.custom.title') }} />
      <Stack.Toolbar placement="right">
        {Platform.OS === 'ios' ? (
          <Stack.Toolbar.Button onPress={save}>
            <Stack.Toolbar.Label>{t('generic.save.button')}</Stack.Toolbar.Label>
          </Stack.Toolbar.Button>
        ) : (
          <Stack.Toolbar.View>
            <NativeButton
              variant="text"
              compact
              testID="color-picker-save"
              label={t('generic.save.button')}
              onPress={save}
            />
          </Stack.Toolbar.View>
        )}
      </Stack.Toolbar>
      <View style={{ gap: spacing[5], paddingHorizontal: spacing.pageHorizontalMargin }}>
        <ColorSliders value={draft} onChange={setDraft} />
        <PalettePreview seed={draft} />
      </View>
    </FullHeightScrollView>
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
      <AppText variant="labelLarge" color="onSurfaceVariant">
        <T keyName="settings.theme.custom.preview" />
      </AppText>
      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        {swatches.map((color, i) => (
          <View key={i} style={{ flex: 1, height: spacing[10], borderRadius: spacing[2], backgroundColor: color }} />
        ))}
      </View>
    </View>
  );
}
