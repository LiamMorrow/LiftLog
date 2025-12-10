import Button from '@/components/presentation/gesture-wrappers/button';
import SelectButton, {
  SelectButtonOption,
} from '@/components/presentation/select-button';
import { spacing } from '@/hooks/useAppTheme';
import { supportedLanguages } from '@/services/tolgee';
import { RootState, useAppSelector } from '@/store';
import {
  setFirstDayOfWeek,
  setPreferredLanguage,
  setRestNotifications,
  setShowFeed,
  setUseImperialUnits,
} from '@/store/settings';
import { formatDate, getDateOnDay } from '@/utils/format-date';
import { DayOfWeek } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Switch, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

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

interface WelcomeWizardProps {
  onComplete: () => void;
}

export function WelcomeWizard({ onComplete }: WelcomeWizardProps) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const settings = useAppSelector((state: RootState) => state.settings);
  const [currentPage, setCurrentPage] = useState(0);
  const [crashReportsEnabled, setCrashReportsEnabled] = useState(true);

  const languageOptions: SelectButtonOption<string | undefined>[] = useMemo(
    () => [
      {
        value: undefined,
        label: t('System default'),
      },
      ...supportedLanguages.map((x) => ({ value: x.code, label: x.label })),
    ],
    [t],
  );

  const totalPages = 3;

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
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
          {t('WelcomeToLiftLog')}
        </Text>
        <Text variant="bodyLarge" style={styles.pageSubtitle}>
          {t('WelcomeWizardSubtitle')}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('CrashReports')}
        </Text>
        <Text variant="bodyMedium" style={styles.sectionDescription}>
          {t('CrashReportsDescription')}
        </Text>
        <List.Item
          title={t('SendCrashReports')}
          description={t('SendCrashReportsSubtitle')}
          right={() => (
            <Switch
              value={crashReportsEnabled}
              onValueChange={setCrashReportsEnabled}
            />
          )}
          onPress={() => setCrashReportsEnabled(!crashReportsEnabled)}
        />
      </View>
    </View>
  );

  const renderLocalizationPage = () => (
    <View style={styles.pageContent}>
      <View style={styles.headerSection}>
        <Text variant="headlineMedium" style={styles.pageTitle}>
          {t('Localisation')}
        </Text>
        <Text variant="bodyLarge" style={styles.pageSubtitle}>
          {t('LocalisationSubtitle')}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <List.Item
          title={t('UseImperialUnits')}
          description={t('UseImperialUnitsSubtitle')}
          right={() => (
            <Switch
              value={settings.useImperialUnits}
              onValueChange={(value) => {
                dispatch(setUseImperialUnits(value));
              }}
            />
          )}
          onPress={() =>
            dispatch(setUseImperialUnits(!settings.useImperialUnits))
          }
        />
        <List.Item
          title={t('SetFirstDayOfWeek')}
          description={t('SetFirstDayOfWeekSubtitle')}
          right={() => (
            <SelectButton
              value={settings.firstDayOfWeek}
              options={daysOfWeekOptions}
              onChange={(value) => dispatch(setFirstDayOfWeek(value))}
            />
          )}
        />
        <List.Item
          title={t('Set language')}
          description={t('Set your preferred language')}
          right={() => (
            <SelectButton
              value={settings.preferredLanguage}
              options={languageOptions}
              onChange={(value) => dispatch(setPreferredLanguage(value))}
            />
          )}
        />
      </View>
    </View>
  );

  const renderNotificationsAndFeedPage = () => (
    <View style={styles.pageContent}>
      <View style={styles.headerSection}>
        <Text variant="headlineMedium" style={styles.pageTitle}>
          {t('NotificationsAndFeed')}
        </Text>
        <Text variant="bodyLarge" style={styles.pageSubtitle}>
          {t('NotificationsAndFeedSubtitle')}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {t('Notifications')}
        </Text>
        <List.Item
          title={t('RestNotifications')}
          description={t('RestNotificationsSubtitle')}
          right={() => (
            <Switch
              value={settings.restNotifications}
              onValueChange={(value) => {
                dispatch(setRestNotifications(value));
              }}
            />
          )}
          onPress={() =>
            dispatch(setRestNotifications(!settings.restNotifications))
          }
        />

        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, styles.topSpacing]}
        >
          {t('Feed')}
        </Text>
        <List.Item
          title={t('ShowFeed')}
          description={t('ShowFeedSubtitle')}
          right={() => (
            <Switch
              value={settings.showFeed}
              onValueChange={(value) => {
                dispatch(setShowFeed(value));
              }}
            />
          )}
          onPress={() => dispatch(setShowFeed(!settings.showFeed))}
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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {renderPage()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pageIndicator}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentPage === index && styles.activeDot]}
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
            {t('Previous')}
          </Button>
          <Button mode="contained" onPress={handleNext} style={styles.button}>
            {currentPage === totalPages - 1 ? t('GetStarted') : t('Next')}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.pageHorizontalMargin,
  },
  pageContent: {
    flex: 1,
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
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: spacing[4],
  },
  topSpacing: {
    marginTop: spacing[6],
  },
  footer: {
    padding: spacing.pageHorizontalMargin,
    paddingBottom: spacing[8],
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
