import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import ListSwitch from '@/components/presentation/list-switch';
import { RootState } from '@/store';
import {
  setShowBodyweight,
  setShowFeed,
  setShowTips,
  setSplitWeightByDefault,
  setUseImperialUnits,
} from '@/store/settings';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { Button, List } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

export default function AppConfiguration() {
  const { t } = useTranslate();
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const resetTips = () => {};

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('AppConfiguration') }} />
      <List.Section>
        <ListSwitch
          headline="@UiStrings.UseImperialUnits"
          supportingText="@UiStrings.UseImperialUnitsSubtitle"
          value={settings.useImperialUnits}
          onValueChange={(value) => dispatch(setUseImperialUnits(value))}
        />
        <ListSwitch
          headline="@UiStrings.ShowBodyweight"
          supportingText="@UiStrings.ShowBodyweightSubtitle"
          value={settings.showBodyweight}
          onValueChange={(value) => dispatch(setShowBodyweight(value))}
        />
        <ListSwitch
          data-cy="split-weight-toggle"
          headline="@UiStrings.SplitWeightByDefault"
          supportingText="@UiStrings.SplitWeightByDefaultSubtitle"
          value={settings.splitWeightByDefault}
          onValueChange={(value) => dispatch(setSplitWeightByDefault(value))}
        />
        <ListSwitch
          headline="@UiStrings.ShowFeed"
          supportingText="@UiStrings.ShowFeedSubtitle"
          value={settings.showFeed}
          onValueChange={(value) => dispatch(setShowFeed(value))}
        />

        <ListSwitch
          headline="@UiStrings.ShowTips"
          supportingText="@UiStrings.ShowTipsSubtitle"
          value={settings.showTips}
          onValueChange={(value) => dispatch(setShowTips(value))}
        />
        <Button mode="text" onPress={resetTips}>
          @UiStrings.ResetTips
        </Button>
      </List.Section>
    </FullHeightScrollView>
  );
}
