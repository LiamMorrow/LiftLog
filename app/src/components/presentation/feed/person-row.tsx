import { PersonAvatar } from '@/components/presentation/feed/person-avatar';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { ReactNode } from 'react';
import { View } from 'react-native';

interface PersonRowProps {
  userId: string;
  /** A feed user is free to publish no name at all; the row owns what an unnamed person looks like. */
  name?: string;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}

/** The one row shape every section of the friends list shares, so they can't drift apart. */
export function PersonRow({ userId, name, subtitle, trailing }: PersonRowProps) {
  const { t } = useTranslate();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        minHeight: spacing[16],
        paddingVertical: spacing[2],
        paddingStart: spacing[4],
        paddingEnd: spacing[1],
      }}
    >
      <PersonAvatar userId={userId} name={name} size={40} />

      <View style={{ flex: 1, minWidth: 0 }}>
        <SurfaceText weight="500" numberOfLines={1}>
          {name || t('feed.anonymous_user.label')}
        </SurfaceText>
        {subtitle ? (
          <SurfaceText font="text-sm" color="onSurfaceVariant" numberOfLines={2}>
            {subtitle}
          </SurfaceText>
        ) : null}
      </View>

      {trailing}
    </View>
  );
}
