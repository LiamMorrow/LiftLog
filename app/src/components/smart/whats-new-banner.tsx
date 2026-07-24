import Button from '@/components/presentation/foundation/button';
import IconButton from '@/components/presentation/foundation/icon-button';
import { Pager } from '@/components/presentation/foundation/pager';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { latestWhatsNewId, WhatsNewEntry } from '@/models/whats-new';
import { useAppSelector } from '@/store';
import { selectUnseenWhatsNew, setLastSeenWhatsNewId } from '@/store/settings';
import { T } from '@tolgee/react';
import { Href, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { shallowEqual, useDispatch } from 'react-redux';

export function WhatsNewBanner() {
  const unseen = useAppSelector(selectUnseenWhatsNew, shallowEqual);
  const dispatch = useDispatch();
  const { colors } = useAppTheme();
  const { push } = useRouter();

  if (!unseen.length) {
    return null;
  }

  const dismiss = () => dispatch(setLastSeenWhatsNewId(latestWhatsNewId));

  const goToFeature = (route: Href) => {
    push(route);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.tertiaryContainer }]}>
      <View style={styles.header}>
        <Text variant="labelSmall" style={{ color: colors.onTertiaryContainer, letterSpacing: 1 }}>
          <T keyName="whats_new.eyebrow" />
        </Text>
        <IconButton icon="close" size={18} onPress={dismiss} iconColor={colors.onTertiaryContainer} />
      </View>

      <Pager indicatorColor={colors.onTertiaryContainer}>
        {unseen.map((entry) => (
          <Feature key={entry.id} entry={entry} onPress={goToFeature} />
        ))}
      </Pager>
    </View>
  );
}

function Feature({ entry, onPress }: { entry: WhatsNewEntry; onPress: (route: Href) => void }) {
  const { colors } = useAppTheme();
  return (
    <>
      <View style={styles.featureRow}>
        <View style={[styles.iconWell, { backgroundColor: colors.tertiary }]}>
          <Icon source={entry.icon} size={22} color={colors.onTertiary} />
        </View>
        <Text variant="titleMedium" style={{ color: colors.onTertiaryContainer, flexShrink: 1 }}>
          <T keyName={entry.titleKey} />
        </Text>
      </View>
      <Text variant="bodySmall" style={{ color: colors.onTertiaryContainer, marginTop: spacing[2], opacity: 0.9 }}>
        <T keyName={entry.bodyKey} />
      </Text>
      {entry.cta && (
        <View style={styles.ctaRow}>
          <Button mode="text" textColor={colors.onTertiaryContainer} onPress={() => onPress(entry.cta!.route)}>
            <T keyName={entry.cta.labelKey} />
          </Button>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: spacing[4],
    gap: spacing[1],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconWell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing[2],
  },
});
