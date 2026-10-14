import Button from '@/components/presentation/foundation/button';
import { Pager } from '@/components/presentation/foundation/pager';
import { SelectPickerOption } from '@/components/presentation/foundation/select-picker';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSwitch } from '@/components/presentation/foundation/segmented-list-switch';
import { SegmentedListSelect } from '@/components/presentation/foundation/segmented-list-select';
import Icon from '@/components/presentation/foundation/icon';
import ThemeChooser from '@/components/presentation/foundation/editors/theme-chooser';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { supportedLanguages } from '@/services/tolgee';
import { useAppSelector } from '@/store';
import {
  setColorSchemeSeed,
  setFirstDayOfWeek,
  setLastSeenWhatsNewId,
  setPreferredLanguage,
  setRestNotifications,
  setShowFeed,
  setThemeMode,
  setTrueBlackDarkTheme,
  setUseImperialUnits,
  setWelcomeWizardCompleted,
} from '@/store/settings';
import { latestWhatsNewId } from '@/models/whats-new';
import { getDateOnDay } from '@/utils/format-date';
import { DayOfWeek } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Portal, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { openUrl } from '@/utils/open-url';
import { useFormatDate } from '@/hooks/useFormatDate';
import { requestPermissionsAsync } from 'expo-notifications';
import { HealthExportSwitch, useCanExportHealth } from './health-export-switch';

export function WelcomeWizard() {
  const notificationsEnabled = useAppSelector((x) => x.settings.restNotifications);
  const formatDate = useFormatDate();
  const daysOfWeekOptions: SelectPickerOption<DayOfWeek>[] = [
    {
      value: DayOfWeek.SUNDAY,
      label: formatDate(getDateOnDay(DayOfWeek.SUNDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.MONDAY,
      label: formatDate(getDateOnDay(DayOfWeek.MONDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.TUESDAY,
      label: formatDate(getDateOnDay(DayOfWeek.TUESDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.WEDNESDAY,
      label: formatDate(getDateOnDay(DayOfWeek.WEDNESDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.THURSDAY,
      label: formatDate(getDateOnDay(DayOfWeek.THURSDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.FRIDAY,
      label: formatDate(getDateOnDay(DayOfWeek.FRIDAY), { weekday: 'long' }),
    },
    {
      value: DayOfWeek.SATURDAY,
      label: formatDate(getDateOnDay(DayOfWeek.SATURDAY), { weekday: 'long' }),
    },
  ];

  const { t } = useTranslate();
  const dispatch = useDispatch();
  const settings = useAppSelector((state) => state.settings);
  const welcomeWizardCompleted = settings.welcomeWizardCompleted;
  const { colors } = useAppTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const canExportHealth = useCanExportHealth();

  const languageOptions: SelectPickerOption<string | undefined>[] = useMemo(
    () => [
      {
        value: undefined,
        label: t('settings.system_default.label'),
      },
      ...supportedLanguages.map((x) => ({ value: x.code, label: x.label })),
    ],
    [t],
  );

  const totalPages = 3;

  const handleNext = async () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      dispatch(setWelcomeWizardCompleted(true));
      dispatch(setLastSeenWhatsNewId(latestWhatsNewId));
      if (notificationsEnabled) {
        await requestPermissionsAsync();
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderCrashReportsPage = () => (
    <View style={styles.pageContent}>
      <View style={styles.headerSection}>
        <Text variant="headlineMedium" style={styles.pageTitle}>
          {t('onboarding.welcome.title')}
        </Text>
        <Text variant="bodyLarge" style={styles.pageSubtitle}>
          {t('onboarding.welcome.subtitle')}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <Text variant="titleMedium">{t('onboarding.open_source.title')}</Text>
        <Text variant="bodyMedium" style={styles.sectionDescription}>
          {t('onboarding.open_source.body')}
        </Text>
        <SegmentedGroup>
          <SegmentListFormElement
            label={t('onboarding.open_source.button')}
            icon={'link'}
            onPress={() => openUrl('https://github.com/LiamMorrow/LiftLog')}
            right={<Icon source="openInBrowser" size={20} />}
          />
          <SegmentListFormElement
            label={t('onboarding.privacy_policy.button')}
            icon={'description'}
            onPress={() => openUrl('https://liftlog.online/privacy.html')}
            right={<Icon source="openInBrowser" size={20} />}
          />
        </SegmentedGroup>
      </View>
    </View>
  );

  const renderLocalizationPage = () => (
    <View style={styles.pageContent}>
      <View style={styles.headerSection}>
        <Text variant="headlineMedium" style={styles.pageTitle}>
          {t('settings.localisation.title')}
        </Text>
        <Text variant="bodyLarge" style={styles.pageSubtitle}>
          {t('settings.localisation.subtitle')}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <SegmentedGroup>
          <SegmentedListSwitch
            label={t('settings.use_imperial_units.label')}
            icon={'weight'}
            supportingText={t('settings.use_imperial_units.subtitle')}
            value={settings.useImperialUnits}
            onValueChange={(value) => dispatch(setUseImperialUnits(value))}
          />
          <SegmentedListSelect
            label={t('settings.first_day_of_week.label')}
            icon={'calendar'}
            supportingText={t('settings.first_day_of_week.subtitle')}
            value={settings.firstDayOfWeek}
            options={daysOfWeekOptions}
            onChange={(value) => dispatch(setFirstDayOfWeek(value))}
          />
          <SegmentedListSelect
            label={t('settings.set_language.button')}
            icon={'language'}
            supportingText={t('settings.set_language.subtitle')}
            value={settings.preferredLanguage}
            options={languageOptions}
            onChange={(value) => dispatch(setPreferredLanguage(value))}
          />
        </SegmentedGroup>
        <ThemeChooser
          seed={settings.colorSchemeSeed}
          onUpdateTheme={(x) => dispatch(setColorSchemeSeed(x))}
          setTrueBlack={(b) => dispatch(setTrueBlackDarkTheme(b))}
          trueBlack={settings.trueBlackDarkTheme}
          themeMode={settings.themeMode}
          setThemeMode={(m) => dispatch(setThemeMode(m))}
        />
      </View>
    </View>
  );

  const renderNotificationsAndFeedPage = () => (
    <View style={styles.pageContent}>
      <View style={styles.headerSection}>
        <Text variant="headlineMedium" style={styles.pageTitle}>
          {t('onboarding.notifications_and_feed.title')}
        </Text>
        <Text variant="bodyLarge" style={styles.pageSubtitle}>
          {t('onboarding.notifications_and_feed.subtitle')}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <Text variant="titleMedium">{t('settings.notifications.title')}</Text>
        <SegmentedGroup>
          <SegmentedListSwitch
            label={t('rest.notifications.title')}
            icon={'notifications'}
            supportingText={t('rest.notifications.subtitle')}
            value={settings.restNotifications}
            onValueChange={(value) => dispatch(setRestNotifications(value))}
          />
        </SegmentedGroup>

        <Text variant="titleMedium" style={styles.topSpacing}>
          {t('feed.feed.title')}
        </Text>
        <SegmentedGroup>
          <SegmentedListSwitch
            label={t('feed.show_feed.label')}
            icon={'forum'}
            supportingText={t('feed.show_feed.subtitle')}
            value={settings.showFeed}
            onValueChange={(value) => dispatch(setShowFeed(value))}
          />
          {canExportHealth ? <HealthExportSwitch /> : undefined}
        </SegmentedGroup>
      </View>
    </View>
  );

  return (
    !welcomeWizardCompleted && (
      <Portal>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={[styles.container]}>
            <Pager fill page={currentPage} onPageChange={setCurrentPage}>
              {renderCrashReportsPage()}
              {renderLocalizationPage()}
              {renderNotificationsAndFeedPage()}
            </Pager>

            <View style={styles.footer}>
              <View style={styles.buttonRow}>
                <Button mode="text" onPress={handlePrevious} disabled={currentPage === 0} style={styles.button}>
                  {t('generic.previous.button')}
                </Button>
                <Button mode="contained" onPress={() => void handleNext()} style={styles.button}>
                  {currentPage === totalPages - 1 ? t('onboarding.get_started.button') : t('generic.next.button')}
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Portal>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContent: {
    flex: 1,
    marginTop: spacing.pageHorizontalMargin,
  },
  headerSection: {
    marginBottom: spacing[8],
    alignItems: 'center',
  },
  pageTitle: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  pageSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  settingsSection: {
    flex: 1,
    paddingHorizontal: spacing.pageHorizontalMargin,
    gap: spacing[4],
  },
  sectionDescription: {
    opacity: 0.7,
  },
  topSpacing: {
    marginTop: spacing[6],
  },
  footer: {
    padding: spacing.pageHorizontalMargin,
    paddingBottom: spacing[8],
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  button: {
    flex: 1,
  },
});
