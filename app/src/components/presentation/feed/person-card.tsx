import { PersonAvatar } from '@/components/presentation/feed/person-avatar';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';

interface PersonCardProps {
  userId: string;
  /** A feed user is free to publish no name at all; the card owns what an unnamed person looks like. */
  name?: string;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}

/** The one row shape the Following and Followers tabs share, so they can't drift apart again. */
export function PersonCard({ userId, name, subtitle, trailing, children }: PersonCardProps) {
  const { t } = useTranslate();

  return (
    <Card mode="contained">
      <Card.Content style={{ gap: spacing[3] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
          <PersonAvatar userId={userId} name={name} />

          <View style={{ flex: 1, gap: spacing[0.5] }}>
            <SurfaceText font="text-lg" weight="bold" numberOfLines={1}>
              {name || t('feed.anonymous_user.label')}
            </SurfaceText>
            {subtitle ? (
              <SurfaceText font="text-sm" color="onSurfaceVariant" numberOfLines={1}>
                {subtitle}
              </SurfaceText>
            ) : null}
          </View>

          {trailing}
        </View>

        {children}
      </Card.Content>
    </Card>
  );
}
