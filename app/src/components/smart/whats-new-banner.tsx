import { NativeButton } from '@/components/presentation/foundation/native-button';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import CloseIcon from '@expo/material-symbols/close.xml';
import { Pager } from '@/components/presentation/foundation/pager';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { latestWhatsNewId, WhatsNewEntry } from '@/models/whats-new';
import { useAppSelector } from '@/store';
import { selectUnseenWhatsNew, setLastSeenWhatsNewId } from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Href, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import { shallowEqual, useDispatch } from 'react-redux';

export function WhatsNewBanner() {
  const { t } = useTranslate();
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
        <AppText variant="labelSmall" style={{ color: colors.onTertiaryContainer, letterSpacing: 1 }}>
          <T keyName="whats_new.eyebrow" />
        </AppText>
        <View style={styles.close}>
          <NativeIconButton
            icon={CloseIcon}
            systemImage="xmark"
            iconSize={18}
            colors={{ content: colors.onTertiaryContainer }}
            label={t('generic.close.button')}
            onPress={dismiss}
          />
        </View>
      </View>

      <Pager indicatorColor={colors.onTertiaryContainer} showIndicator={unseen.length > 1}>
        {unseen.map((entry) => (
          <Feature key={entry.id} entry={entry} onPress={goToFeature} />
        ))}
      </Pager>
    </View>
  );
}

function Feature({ entry, onPress }: { entry: WhatsNewEntry; onPress: (route: Href) => void }) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  return (
    <>
      <View style={styles.featureRow}>
        <View style={[styles.iconWell, { backgroundColor: colors.tertiary }]}>
          <NativeIcon icon={entry.icon} systemImage={entry.systemImage} size={22} color={colors.onTertiary} />
        </View>
        <AppText variant="titleMedium" style={{ color: colors.onTertiaryContainer, flexShrink: 1 }}>
          <T keyName={entry.titleKey} />
        </AppText>
      </View>
      <AppText variant="bodySmall" style={{ color: colors.onTertiaryContainer, marginTop: spacing[2], opacity: 0.9 }}>
        <T keyName={entry.bodyKey} />
      </AppText>
      {entry.cta && (
        <View style={styles.ctaRow}>
          <NativeButton
            variant="text"
            contentColor={colors.onTertiaryContainer}
            label={t(entry.cta.labelKey)}
            onPress={() => onPress(entry.cta!.route)}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: spacing[4],
    paddingBottom: spacing[2],
    gap: spacing[3],
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
  close: {
    margin: -spacing[2],
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
