import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Button from '@/components/presentation/foundation/button';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { latestWhatsNewId, whatsNewEntries, WhatsNewEntry } from '@/models/whats-new';
import { useAppSelector } from '@/store';
import { selectHasUnseenWhatsNew, setLastSeenWhatsNewId } from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Card, Icon, Text } from 'react-native-paper';
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
  const { push } = useRouter();
  const goToFeature = (route: Href) => push(route);

  return (
    <Card mode="contained">
      <Card.Content style={{ gap: spacing[2] }}>
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
            <Icon source={entry.icon} size={24} color={colors.onSecondaryContainer} />
          </View>
          <Text variant="titleMedium" style={{ flexShrink: 1 }}>
            <T keyName={entry.titleKey} />
          </Text>
        </View>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          <T keyName={entry.bodyKey} />
        </Text>
        {entry.cta && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button mode="text" onPress={() => goToFeature(entry.cta!.route)}>
              {entry.cta.labelKey && <T keyName={entry.cta.labelKey} />}
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}
