import Button from '@/components/presentation/gesture-wrappers/button';
import ListSwitch from '@/components/presentation/list-switch';
import SelectButton, {
  SelectButtonOption,
} from '@/components/presentation/select-button';
import ThemeChooser from '@/components/presentation/theme-chooser';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { supportedLanguages } from '@/services/tolgee';
import { useAppSelector } from '@/store';
import {
  setColorSchemeSeed,
  setCrashReportsEnabled,
  setFirstDayOfWeek,
  setPreferredLanguage,
  setRestNotifications,
  setShowFeed,
  setUseImperialUnits,
  setWelcomeWizardCompleted,
} from '@/store/settings';
import { getDateOnDay } from '@/utils/format-date';
import { DayOfWeek } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useMemo, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { List, Portal, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useFormatDate } from '@/hooks/useFormatDate';
import { requestPermissionsAsync } from 'expo-notifications';

export function WelcomeWizard() {
  const notificationsEnabled = useAppSelector(
    (x) => x.settings.restNotifications,
  );
  const formatDate = useFormatDate();
  const daysOfWeekOptions: SelectButtonOption<DayOfWeek>[] = [
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
  const openUrl = (url: string) => {
    void Linking.canOpenURL(url).then(() => Linking.openURL(url));
  };

  const languageOptions: SelectButtonOption<string | undefined>[] = useMemo(
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
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('onboarding.open_source.title')}
        </Text>
        <Text variant="bodyMedium" style={styles.sectionDescription}>
          {t('onboarding.open_source.body')}
        </Text>
        <Button
          onPress={() => openUrl('https://github.com/LiamMorrow/LiftLog')}
        >
          {t('onboarding.open_source.button')}
        </Button>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('onboarding.crash_reports.title')}
        </Text>
        <Text variant="bodyMedium" style={styles.sectionDescription}>
          {t('onboarding.crash_reports.explanation')}
        </Text>
        <ListSwitch
          headline={t('onboarding.send_crash_reports.label')}
          supportingText={t('onboarding.send_crash_reports.subtitle')}
          value={settings.crashReportsEnabled}
          onValueChange={(value) => dispatch(setCrashReportsEnabled(value))}
        />
        <Button onPress={() => openUrl('https://liftlog.online/privacy.html')}>
          {t('onboarding.privacy_policy.button')}
        </Button>
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
        <ListSwitch
          headline={t('settings.use_imperial_units.label')}
          supportingText={t('settings.use_imperial_units.subtitle')}
          value={settings.useImperialUnits}
          onValueChange={(value) => dispatch(setUseImperialUnits(value))}
        />
        <List.Item
          title={t('settings.first_day_of_week.label')}
          description={t('settings.first_day_of_week.subtitle')}
          right={() => (
            <SelectButton
              value={settings.firstDayOfWeek}
              options={daysOfWeekOptions}
              onChange={(value) => dispatch(setFirstDayOfWeek(value))}
            />
          )}
        />
        <List.Item
          title={t('settings.set_language.button')}
          description={t('settings.set_language.subtitle')}
          right={() => (
            <SelectButton
              value={settings.preferredLanguage}
              options={languageOptions}
              onChange={(value) => dispatch(setPreferredLanguage(value))}
            />
          )}
        />
        <ThemeChooser
          seed={settings.colorSchemeSeed}
          onUpdateTheme={(x) => dispatch(setColorSchemeSeed(x))}
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
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('settings.notifications.title')}
        </Text>
        <ListSwitch
          headline={t('rest.notifications.title')}
          supportingText={t('rest.notifications.subtitle')}
          value={settings.restNotifications}
          onValueChange={(value) => dispatch(setRestNotifications(value))}
        />

        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, styles.topSpacing]}
        >
          {t('feed.feed.title')}
        </Text>
        <ListSwitch
          headline={t('feed.show_feed.label')}
          supportingText={t('feed.show_feed.subtitle')}
          value={settings.showFeed}
          onValueChange={(value) => dispatch(setShowFeed(value))}
        />
      </View>
    </View>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 0:
        return renderCrashReportsPage();
      case 1:
        return renderLocalizationPage();
      case 2:
        return renderNotificationsAndFeedPage();
      default:
        return null;
    }
  };
  return (
    !welcomeWizardCompleted && (
      <Portal>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={[styles.container]}>
            {renderPage()}

            <View style={styles.footer}>
              <View style={styles.pageIndicator}>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentPage === index && styles.activeDot,
                    ]}
                  />
                ))}
              </View>

              <View style={styles.buttonRow}>
                <Button
                  mode="text"
                  onPress={handlePrevious}
                  disabled={currentPage === 0}
                  style={styles.button}
                >
                  {t('generic.previous.button')}
                </Button>
                <Button
                  mode="contained"
                  testID="welcome-wizard-next"
                  onPress={() => void handleNext()}
                  style={styles.button}
                >
                  {currentPage === totalPages - 1
                    ? t('onboarding.get_started.button')
                    : t('generic.next.button')}
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
  },
  sectionTitle: {
    marginBottom: spacing[2],
    marginTop: spacing[4],
    marginHorizontal: spacing.pageHorizontalMargin,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: spacing[4],
    marginHorizontal: spacing.pageHorizontalMargin,
  },
  topSpacing: {
    marginTop: spacing[6],
  },
  footer: {
    padding: spacing.pageHorizontalMargin,
    paddingBottom: spacing[8],
    marginTop: 'auto',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  dot: {
    width: spacing[2],
    height: spacing[2],
    borderRadius: spacing[1],
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
  },
  activeDot: {
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
    width: spacing[6],
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
