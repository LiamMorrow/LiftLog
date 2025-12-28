import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import Button from '@/components/presentation/gesture-wrappers/button';
import ListSwitch from '@/components/presentation/list-switch';
import ThemeChooser from '@/components/presentation/theme-chooser';
import { RootState, useAppSelector } from '@/store';
import {
  setColorSchemeSeed,
  setCrashReportsEnabled,
  setKeepScreenAwakeDuringWorkout,
  setNotesExpandedByDefault,
  setShowBodyweight,
  setShowFeed,
  setShowTips,
  setWelcomeWizardCompleted,
} from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { List } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { spacing } from '@/hooks/useAppTheme';

export default function AppConfiguration() {
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  return (
    <FullHeightScrollView>
      <Stack.Screen
        options={{ title: t('settings.app_configuration.title') }}
      />
      <List.Section>
        <ListSwitch
          testID="setShowBodyweight"
          headline={<T keyName="settings.show_bodyweight.label" />}
          supportingText={<T keyName="settings.show_bodyweight.subtitle" />}
          value={settings.showBodyweight}
          onValueChange={(value) => dispatch(setShowBodyweight(value))}
        />
        <ListSwitch
          headline={<T keyName="feed.show_feed.label" />}
          supportingText={<T keyName="feed.show_feed.subtitle" />}
          value={settings.showFeed}
          onValueChange={(value) => dispatch(setShowFeed(value))}
        />

        <ListSwitch
          headline={<T keyName="workout.notes_expanded_by_default.label" />}
          supportingText={
            <T keyName="workout.notes_expanded_by_default.subtitle" />
          }
          value={settings.notesExpandedByDefault}
          onValueChange={(value) => dispatch(setNotesExpandedByDefault(value))}
        />
        <ListSwitch
          headline={<T keyName="workout.keep_screen_awake.label" />}
          supportingText={<T keyName="workout.keep_screen_awake.subtitle" />}
          value={settings.keepScreenAwakeDuringWorkout}
          onValueChange={(value) =>
            dispatch(setKeepScreenAwakeDuringWorkout(value))
          }
        />
        <ListSwitch
          headline={<T keyName="settings.show_tips.label" />}
          supportingText={<T keyName="settings.show_tips.subtitle" />}
          value={settings.showTips}
          onValueChange={(value) => dispatch(setShowTips(value))}
        />
        <ListSwitch
          headline={t('onboarding.send_crash_reports.label')}
          supportingText={t('onboarding.send_crash_reports.subtitle')}
          value={settings.crashReportsEnabled}
          onValueChange={(value) => dispatch(setCrashReportsEnabled(value))}
        />

        <ThemeChooser
          seed={settings.colorSchemeSeed}
          onUpdateTheme={(x) => dispatch(setColorSchemeSeed(x))}
        />
        <Button
          onPress={() => dispatch(setWelcomeWizardCompleted(false))}
          mode="outlined"
          style={{ marginHorizontal: spacing.pageHorizontalMargin }}
        >
          {t('onboarding.start_setup_wizard.button')}
        </Button>
      </List.Section>
    </FullHeightScrollView>
  );
}
