import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

interface StatAttributeCardProps {
  abbr: string;
  label: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
}

export default function StatAttributeCard({
  abbr,
  label,
  value,
  subtitle,
  icon,
  color,
}: StatAttributeCardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surfaceContainer,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        borderLeftWidth: 3,
        borderLeftColor: color,
        padding: spacing[3],
        gap: spacing[2],
        minHeight: 100,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
        <Icon source={icon} size={16} color={color} />
        <Text variant="labelSmall" style={{ color, letterSpacing: 1 }}>
          {abbr}
        </Text>
      </View>
      <Text variant="headlineSmall" style={{ color: colors.onSurface }}>
        {value}
      </Text>
      <View style={{ gap: 2 }}>
        <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
          {label}
        </Text>
        <Text
          variant="labelSmall"
          style={{ color: colors.onSurfaceVariant, opacity: 0.6 }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
