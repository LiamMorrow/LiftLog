import { SectionHeader } from '@/components/presentation/foundation/section-header';
import { font, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';

export function SupersetGroup({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();

  return (
    <View testID="superset-group" style={{ paddingTop: spacing[3] }}>
      <View
        style={{
          position: 'absolute',
          left: (spacing.pageHorizontalMargin - spacing[1]) / 2,
          top: spacing[3],
          bottom: spacing[4],
          width: spacing[1],
          borderRadius: spacing[0.5],
          backgroundColor: colors.tertiary,
        }}
      />
      <SectionHeader
        title={t('workout.superset.label')}
        style={{ paddingHorizontal: spacing.pageHorizontalMargin, marginBottom: -spacing[3] }}
      />
      {children}
    </View>
  );
}

export function SupersetBadge({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <View
      testID="superset-label"
      style={{
        minWidth: spacing[9],
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[0.5],
        borderRadius: spacing[2],
        alignItems: 'center',
        backgroundColor: colors.tertiaryContainer,
      }}
    >
      <Text style={{ ...font['text-base'], fontWeight: 'bold', color: colors.onTertiaryContainer }}>{label}</Text>
    </View>
  );
}
