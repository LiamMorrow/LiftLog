import FocusRing, { ANIMATION_DURATION } from '@/components/presentation/foundation/focus-ring';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { ColorSchemeSeed, ThemeMode } from '@/store/settings';
import { hsvToHex, type HexColor } from '@/utils/color';
import { sleep } from '@/utils/sleep';
import { createMaterial3Theme } from '@pchmn/expo-material3-theme';
import { T, useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { List } from 'react-native-paper';
import Button from '@/components/presentation/foundation/button';
import ListSwitch from '@/components/presentation/foundation/list-switch';
import ColorPickerDialog from '@/components/presentation/foundation/editors/color-picker-dialog';
import SelectPicker, { SelectPickerOption } from '@/components/presentation/foundation/select-picker';

interface ThemeChooserProps {
  seed: ColorSchemeSeed;
  trueBlack: boolean;
  setTrueBlack: (t: boolean) => void;
  onUpdateTheme: (seed: ColorSchemeSeed) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

function ColorBall(props: {
  selectedSeed: ColorSchemeSeed;
  seed: `#${string}`;
  onUpdateTheme: (seed: ColorSchemeSeed) => void | Promise<void>;
}) {
  const { colors, colorScheme } = useAppTheme();
  const theme = createMaterial3Theme(props.seed);
  const isSelected = props.seed === props.selectedSeed;

  return (
    <FocusRing isSelected={isSelected}>
      <View
        style={{
          borderRadius: spacing[12],
          overflow: 'hidden',
          borderColor: colors.outline,
        }}
      >
        <TouchableRipple
          style={{
            width: spacing[12],
            height: spacing[12],
            borderRadius: spacing[12],
            backgroundColor: theme[colorScheme].primary,
            borderColor: colors.outlineVariant,
            borderWidth: 2,
          }}
          onPress={() => {
            void props.onUpdateTheme(props.seed);
          }}
        >
          <></>
        </TouchableRipple>
      </View>
    </FocusRing>
  );
}

/** A ball hinting "any color" via a hue ring, or filled with the active custom color when one is set. */
function CustomBall(props: { active: boolean; color: HexColor | undefined; onPress: () => void }) {
  const { colors } = useAppTheme();
  const size = spacing[12];
  // Many thin wedges make the hue transitions blend into a smooth conic gradient (SVG has no conic).
  const count = 180;
  const step = (2 * Math.PI) / count;
  const r = size / 2;
  const wedges = Array.from({ length: count }, (_, i) => {
    const a0 = i * step - step;
    const a1 = (i + 1) * step + step;
    return {
      d: `M ${r} ${r} L ${r + r * Math.cos(a0)} ${r + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${r + r * Math.cos(a1)} ${r + r * Math.sin(a1)} Z`,
      fill: hsvToHex((i / count) * 360, 0.85, 1),
    };
  });

  return (
    <FocusRing isSelected={props.active}>
      <View style={{ borderRadius: size, overflow: 'hidden', borderColor: colors.outline }}>
        <TouchableRipple
          style={{
            width: size,
            height: size,
            borderRadius: size,
            borderColor: colors.outlineVariant,
            borderWidth: 2,
            overflow: 'hidden',
          }}
          onPress={props.onPress}
        >
          {props.active && props.color ? (
            <View style={{ flex: 1, backgroundColor: props.color }} />
          ) : (
            <Svg width={size} height={size}>
              {wedges.map((w, i) => (
                <Path key={i} d={w.d} fill={w.fill} />
              ))}
            </Svg>
          )}
        </TouchableRipple>
      </View>
    </FocusRing>
  );
}

const PRESET_SEEDS = ['#550000', '#005500', '#000055', '#AA00AA', '#00AAAA', '#AAAA00', '#FFC0CB', '#7f3f00'] as const;

export default function ThemeChooser(props: ThemeChooserProps) {
  const { t } = useTranslate();
  const [selectedSeed, setSelectedSeed] = useState(props.seed);
  const [pickerOpen, setPickerOpen] = useState(false);

  const updateSeed = async (seed: ColorSchemeSeed) => {
    setSelectedSeed(seed);
    await sleep(ANIMATION_DURATION);
    props.onUpdateTheme(seed);
  };

  const colorSeeds = PRESET_SEEDS;
  const isCustom = selectedSeed !== 'default' && !colorSeeds.includes(selectedSeed as (typeof PRESET_SEEDS)[number]);

  const renderColorBall = ({ item }: { item: `#${string}` }) => (
    <ColorBall selectedSeed={selectedSeed} seed={item} onUpdateTheme={updateSeed} />
  );

  const themeModeOptions: SelectPickerOption<ThemeMode>[] = [
    { value: 'system', label: t('settings.theme.mode.system') },
    { value: 'light', label: t('settings.theme.mode.light') },
    { value: 'dark', label: t('settings.theme.mode.dark') },
  ];

  return (
    <>
      <List.Item title={t('settings.theme.title')} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[4],
          width: '100%',
          overflow: 'scroll',
          paddingHorizontal: spacing.pageHorizontalMargin,
          paddingVertical: spacing[2],
        }}
      >
        <FocusRing isSelected={selectedSeed === 'default'}>
          <Button style={{ position: 'relative' }} onPress={() => void updateSeed('default')}>
            <T keyName="generic.default.label" />
          </Button>
        </FocusRing>
        <FlatList
          horizontal
          data={colorSeeds}
          renderItem={renderColorBall}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing[2], padding: spacing[2], alignItems: 'center' }}
          ListFooterComponent={
            <CustomBall
              active={isCustom}
              color={isCustom ? selectedSeed : undefined}
              onPress={() => setPickerOpen(true)}
            />
          }
        />
      </View>
      <List.Item
        title={t('settings.theme.mode.label')}
        right={() => (
          <SelectPicker
            testID="setThemeMode"
            value={props.themeMode}
            options={themeModeOptions}
            onChange={props.setThemeMode}
          />
        )}
      />
      <ListSwitch
        headline={t('settings.app_configuration.true_black_dark_theme.title')}
        value={props.trueBlack}
        onValueChange={props.setTrueBlack}
      />
      <ColorPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialSeed={selectedSeed}
        onConfirm={(seed) => void updateSeed(seed)}
      />
    </>
  );
}
