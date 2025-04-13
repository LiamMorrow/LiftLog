import FocusRing, {
  ANIMATION_DURATION,
} from '@/components/presentation/focus-ring';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { ColorSchemeSeed } from '@/store/settings';
import { sleep } from '@/utils/sleep';
import { createMaterial3Theme } from '@pchmn/expo-material3-theme';
import { T, useTranslate } from '@tolgee/react';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, List, TouchableRipple } from 'react-native-paper';

interface ThemeChooserProps {
  seed: ColorSchemeSeed;
  onUpdateTheme: (seed: ColorSchemeSeed) => void;
}

function ColorBall(props: {
  selectedSeed: ColorSchemeSeed;
  seed: `#${string}`;
  onUpdateTheme: (seed: ColorSchemeSeed) => void;
}) {
  const { colors } = useAppTheme();
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
          onPress={async () => {
            props.onUpdateTheme(props.seed);
          }}
        >
          <></>
        </TouchableRipple>
      </View>
    </FocusRing>
  );
}

export default function ThemeChooser(props: ThemeChooserProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const [selectedSeed, setSelectedSeed] = useState(props.seed);

  const updateSeed = async (seed: ColorSchemeSeed) => {
    setSelectedSeed(seed);
    await sleep(ANIMATION_DURATION);
    props.onUpdateTheme(seed);
  };

  return (
    <>
      <List.Item title={t('Theme')} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[4],
          width: '100%',
          overflow: 'scroll',
          padding: spacing[2],
        }}
      >
        <FocusRing isSelected={selectedSeed === 'default'}>
          <Button
            style={{ position: 'relative' }}
            onPress={() => updateSeed('default')}
          >
            <T keyName="Default" />
          </Button>
        </FocusRing>
        <View style={{ gap: spacing[2], flexDirection: 'row' }}>
          <ColorBall
            selectedSeed={selectedSeed}
            seed="#AA0000"
            onUpdateTheme={updateSeed}
          />
          <ColorBall
            selectedSeed={selectedSeed}
            seed="#00AA00"
            onUpdateTheme={updateSeed}
          />
          <ColorBall
            selectedSeed={selectedSeed}
            seed="#0000AA"
            onUpdateTheme={updateSeed}
          />
          <ColorBall
            selectedSeed={selectedSeed}
            seed="#AA00AA"
            onUpdateTheme={updateSeed}
          />
          <ColorBall
            selectedSeed={selectedSeed}
            seed="#00AAAA"
            onUpdateTheme={updateSeed}
          />
          <ColorBall
            selectedSeed={selectedSeed}
            seed="#AAAA00"
            onUpdateTheme={updateSeed}
          />
          <ColorBall
            selectedSeed={selectedSeed}
            seed="#FFC0CB"
            onUpdateTheme={updateSeed}
          />
          <ColorBall
            selectedSeed={selectedSeed}
            seed="#7f3f00"
            onUpdateTheme={updateSeed}
          />
        </View>
      </View>
    </>
  );
}
