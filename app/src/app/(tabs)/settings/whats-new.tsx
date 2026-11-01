import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { Card, CardContent } from '@/components/presentation/foundation/card';
import { NativeButton } from '@/components/presentation/foundation/native-button';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { latestWhatsNewId, whatsNewEntries, WhatsNewEntry } from '@/models/whats-new';
import { useAppSelector } from '@/store';
import { selectHasUnseenWhatsNew, setLastSeenWhatsNewId } from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import { useDispatch } from 'react-redux';

export default function WhatsNew() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const hasUnseen = useAppSelector(selectHasUnseenWhatsNew);

  useEffect(() => {
    if (hasUnseen) {
      dispatch(setLastSeenWhatsNewId(latestWhatsNewId));
    }
  }, [hasUnseen, dispatch]);

  const entries = [...whatsNewEntries].reverse();

  return (
    <FullHeightScrollView scrollStyle={{ paddingHorizontal: spacing.pageHorizontalMargin }}>
      <Stack.Screen options={{ title: t('whats_new.title') }} />
      <View style={{ gap: spacing[3], paddingTop: spacing[4] }}>
        {entries.map((entry) => (
          <WhatsNewCard key={entry.id} entry={entry} />
        ))}
      </View>
    </FullHeightScrollView>
  );
}

function WhatsNewCard({ entry }: { entry: WhatsNewEntry }) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const { push } = useRouter();
  const goToFeature = (route: Href) => push(route);

  return (
    <Card>
      <CardContent style={{ gap: spacing[2] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.secondaryContainer,
            }}
          >
            <NativeIcon
              icon={entry.icon}
              systemImage={entry.systemImage}
              size={24}
              color={colors.onSecondaryContainer}
            />
          </View>
          <AppText variant="titleMedium" style={{ flexShrink: 1 }}>
            <T keyName={entry.titleKey} />
          </AppText>
        </View>
        <AppText variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          <T keyName={entry.bodyKey} />
        </AppText>
        {entry.cta && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <NativeButton variant="text" label={t(entry.cta.labelKey)} onPress={() => goToFeature(entry.cta!.route)} />
          </View>
        )}
      </CardContent>
    </Card>
  );
}
