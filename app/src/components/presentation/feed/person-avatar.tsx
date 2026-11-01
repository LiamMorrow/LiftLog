import { AppText } from '@/components/presentation/foundation/app-text';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import PersonIcon from '@expo/material-symbols/person.xml';
import { ColorChoice, useAppTheme } from '@/hooks/useAppTheme';
import { View } from 'react-native';

/**
 * Every one of these is harmonized with the theme seed, so the ring of avatars stays in key whatever colour
 * the user picked. Red is left out: it reads as an error, and an avatar is never one.
 */
const AVATAR_COLORS = ['teal', 'purple', 'blue', 'pink', 'indigo', 'amber', 'green', 'cyan', 'brown', 'lime'] as const;

const DEFAULT_SIZE = 44;

interface PersonAvatarProps {
  userId: string;
  name?: string;
  size?: number;
}

export function PersonAvatar({ userId, name, size = DEFAULT_SIZE }: PersonAvatarProps) {
  const { colors } = useAppTheme();

  const color = AVATAR_COLORS[hash(userId) % AVATAR_COLORS.length]!;
  const initials = initialsOf(name);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors[color],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {initials ? (
        <AppText
          variant={size < 32 ? 'labelMedium' : size < 64 ? 'titleMedium' : 'headlineLarge'}
          color={`on${capitalize(color)}`}
        >
          {initials}
        </AppText>
      ) : (
        <NativeIcon
          icon={PersonIcon}
          systemImage="person.fill"
          size={size / 2}
          color={colors[`on${capitalize(color)}` as ColorChoice]}
        />
      )}
    </View>
  );
}

function initialsOf(name: string | undefined): string | undefined {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length === 0) {
    return undefined;
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

function capitalize<T extends string>(value: T) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}` as Capitalize<T>;
}

function hash(value: string): number {
  let result = 0;
  for (let i = 0; i < value.length; i++) {
    result = (result * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(result);
}
