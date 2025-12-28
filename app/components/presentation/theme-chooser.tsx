import FocusRing, {
  ANIMATION_DURATION,
} from '@/components/presentation/focus-ring';
import TouchableRipple from '@/components/presentation/gesture-wrappers/touchable-ripple';
import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { ColorSchemeSeed } from '@/store/settings';
import { sleep } from '@/utils/sleep';
import { createMaterial3Theme } from '@pchmn/expo-material3-theme';
import { T, useTranslate } from '@tolgee/react';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { List } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';

interface ThemeChooserProps {
  seed: ColorSchemeSeed;
  onUpdateTheme: (seed: ColorSchemeSeed) => void;
}

function ColorBall(props: {
  selectedSeed: ColorSchemeSeed;
  seed: `#${string}`;
  onUpdateTheme: (seed: ColorSchemeSeed) => void | Promise<void>;
}) {
  const { colors, colorScheme } = useAppTheme();
  const theme = useMemo(() => createMaterial3Theme(props.seed), [props.seed]);
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

export default function ThemeChooser(props: ThemeChooserProps) {
  const { t } = useTranslate();
  const [selectedSeed, setSelectedSeed] = useState(props.seed);

  const updateSeed = async (seed: ColorSchemeSeed) => {
    setSelectedSeed(seed);
    await sleep(ANIMATION_DURATION);
    props.onUpdateTheme(seed);
  };

  const colorSeeds = [
    '#550000',
    '#0x005500',
    '#000055',
    '#AA00AA',
    '#00AAAA',
    '#AAAA00',
    '#FFC0CB',
    '#7f3f00',
  ] as const;

  const renderColorBall = ({ item }: { item: `#${string}` }) => (
    <ColorBall
      selectedSeed={selectedSeed}
      seed={item}
      onUpdateTheme={updateSeed}
    />
  );

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
          <Button
            style={{ position: 'relative' }}
            onPress={() => void updateSeed('default')}
          >
            <T keyName="generic.default.label" />
          </Button>
        </FocusRing>
        <FlatList
          horizontal
          data={colorSeeds}
          renderItem={renderColorBall}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing[2], padding: spacing[2] }}
        />
      </View>
    </>
  );
}
