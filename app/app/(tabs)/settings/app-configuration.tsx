import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import Button from '@/components/presentation/gesture-wrappers/button';
import ListSwitch from '@/components/presentation/list-switch';
import ThemeChooser from '@/components/presentation/theme-chooser';
import { RootState, useAppSelector } from '@/store';
import {
  setColorSchemeSeed,
  setCrashReportsEnabled,
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

export default function AppConfiguration() {
  const { t } = useTranslate();
  const settings = useAppSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('AppConfiguration') }} />
      <List.Section>
        <ListSwitch
          testID="setShowBodyweight"
          headline={<T keyName="ShowBodyweight" />}
          supportingText={<T keyName="ShowBodyweightSubtitle" />}
          value={settings.showBodyweight}
          onValueChange={(value) => dispatch(setShowBodyweight(value))}
        />
        <ListSwitch
          headline={<T keyName="ShowFeed" />}
          supportingText={<T keyName="ShowFeedSubtitle" />}
          value={settings.showFeed}
          onValueChange={(value) => dispatch(setShowFeed(value))}
        />

        <ListSwitch
          headline={<T keyName="Workout notes expanded by default" />}
          value={settings.notesExpandedByDefault}
          onValueChange={(value) => dispatch(setNotesExpandedByDefault(value))}
        />
        <ListSwitch
          headline={<T keyName="ShowTips" />}
          supportingText={<T keyName="ShowTipsSubtitle" />}
          value={settings.showTips}
          onValueChange={(value) => dispatch(setShowTips(value))}
        />
        <ListSwitch
          headline={t('SendCrashReports')}
          supportingText={t('SendCrashReportsSubtitle')}
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
        >
          {t('StartSetupWizard')}
        </Button>
      </List.Section>
    </FullHeightScrollView>
  );
}
