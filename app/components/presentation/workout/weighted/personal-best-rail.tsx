import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { PersonalBestPill } from '@/utils/personal-bests';
import { useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';

export default function PersonalBestRail({
  pills,
}: {
  pills: PersonalBestPill[];
}) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();

  if (!pills.length) {
    return null;
  }

  return (
    <View
      testID="pb-rail"
      style={{
        width: spacing[28],
        maxHeight: spacing[14],
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          gap: spacing[1],
        }}
      >
        {pills.map((pill) => (
          <View
            key={pill.key}
            accessibilityLabel={t(pill.ariaLabel as never)}
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.secondaryContainer,
              borderColor: colors.outlineVariant,
              borderRadius: spacing[4],
              borderWidth: 1,
              paddingHorizontal: spacing[1],
              paddingVertical: spacing[0.5],
            }}
          >
            <SurfaceText
              color="onSurface"
              font="text-2xs"
              weight="700"
            >
              {pill.label}
            </SurfaceText>
          </View>
        ))}
      </View>
    </View>
  );
}
