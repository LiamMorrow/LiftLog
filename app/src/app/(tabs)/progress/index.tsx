import { ExerciseStatsContent } from '@/components/presentation/data/exercise-stats-content';
import { HistoryContent } from '@/components/presentation/data/history-content';
import { PersonalBestsContent } from '@/components/presentation/data/personal-bests-content';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type ProgressTab = 'exercises' | 'pbs' | 'history';

const FLOATING_TAB_TOP_OFFSET = spacing[2];
const FLOATING_TAB_FLOAT_THRESHOLD = 4;

export default function ProgressPage() {
  const { t } = useTranslate();
  const { colors, colorScheme } = useAppTheme();
  const [tab, setTab] = useState<ProgressTab>('exercises');
  const [isDockFloating, setIsDockFloating] = useState(false);
  const dockBackgroundColor =
    colorScheme === 'dark'
      ? colors.surfaceContainerHighest
      : colors.surfaceContainer;
  const dockBorderColor = colors.outlineVariant;

  useEffect(() => {
    setIsDockFloating(false);
  }, [tab]);

  const header = (
    <ProgressTabsHeader
      currentTab={tab}
      dockBackgroundColor={dockBackgroundColor}
      dockBorderColor={dockBorderColor}
      setTab={setTab}
    />
  );

  return (
    <>
      <Stack.Screen options={{ title: t('progress.title') }} />
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        {isDockFloating ? (
          <View style={styles.floatingTabWidgetOuter} pointerEvents="box-none">
            <LinearGradient
              pointerEvents="none"
              colors={[
                `${colors.scrim}72`,
                `${colors.scrim}44`,
                `${colors.scrim}18`,
                `${colors.scrim}00`,
              ]}
              locations={[0, 0.3, 0.7, 1]}
              style={styles.floatingTabWidgetShade}
            />
            <ProgressTabsHeader
              currentTab={tab}
              dockBackgroundColor={dockBackgroundColor}
              dockBorderColor={dockBorderColor}
              floating
              setTab={setTab}
            />
          </View>
        ) : null}
        {tab === 'exercises' ? (
          <ExerciseStatsContent
            header={header}
            onScroll={(event) =>
              setIsDockFloating(
                event.nativeEvent.contentOffset.y >
                  FLOATING_TAB_FLOAT_THRESHOLD,
              )
            }
            contentContainerStyle={{
              gap: spacing[2],
              paddingHorizontal: spacing.pageHorizontalMargin,
              paddingBottom: spacing[6],
            }}
          />
        ) : tab === 'pbs' ? (
          <PersonalBestsContent
            header={header}
            onScroll={(event) =>
              setIsDockFloating(
                event.nativeEvent.contentOffset.y >
                  FLOATING_TAB_FLOAT_THRESHOLD,
              )
            }
            contentContainerStyle={{
              gap: spacing[4],
              paddingHorizontal: spacing.pageHorizontalMargin,
              paddingBottom: spacing[6],
            }}
          />
        ) : (
          <HistoryContent
            header={header}
            onScroll={(event) =>
              setIsDockFloating(
                event.nativeEvent.contentOffset.y >
                  FLOATING_TAB_FLOAT_THRESHOLD,
              )
            }
            contentContainerStyle={{
              gap: spacing[4],
              paddingHorizontal: spacing.pageHorizontalMargin,
              paddingBottom: spacing[6],
            }}
          />
        )}
      </View>
    </>
  );
}

function ProgressTabsHeader({
  currentTab,
  dockBackgroundColor,
  dockBorderColor,
  floating = false,
  setTab,
}: {
  currentTab: ProgressTab;
  dockBackgroundColor: string;
  dockBorderColor: string;
  floating?: boolean;
  setTab: (tab: ProgressTab) => void;
}) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.tabWidgetOuter,
        floating ? styles.tabWidgetOuterFloating : null,
        { backgroundColor: floating ? 'transparent' : colors.surface },
      ]}
    >
      <View
        style={[
          styles.tabWidget,
          {
            backgroundColor: dockBackgroundColor,
            borderColor: dockBorderColor,
            shadowColor: colors.scrim,
          },
        ]}
      >
        <ProgressTabButton
          active={currentTab === 'exercises'}
          color={colors}
          label={t('exercise.exercises.title')}
          onPress={() => setTab('exercises')}
        />
        <ProgressTabButton
          active={currentTab === 'pbs'}
          color={colors}
          label={t('progress.pbs.title')}
          onPress={() => setTab('pbs')}
        />
        <ProgressTabButton
          active={currentTab === 'history'}
          color={colors}
          label={t('generic.history.title')}
          onPress={() => setTab('history')}
        />
      </View>
    </View>
  );
}

function ProgressTabButton({
  active,
  color,
  label,
  onPress,
}: {
  active: boolean;
  color: ReturnType<typeof useAppTheme>['colors'];
  label: string;
  onPress: () => void;
}) {
  const contentColor = active ? color.onPrimaryContainer : '#ffffff';

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={active ? { selected: true } : {}}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        {
          backgroundColor: active ? color.primaryContainer : 'transparent',
          opacity: pressed ? 0.92 : 1,
        } as const,
      ]}
    >
      <View style={styles.tabButtonContent}>
        <Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            {
              color: contentColor,
              fontWeight: active ? '700' : '600',
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = {
  floatingTabWidgetOuter: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: FLOATING_TAB_TOP_OFFSET,
    zIndex: 20,
  },
  floatingTabWidgetShade: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: -spacing[2],
    height: 72,
  },
  tabWidgetOuter: {
    paddingHorizontal: spacing.pageHorizontalMargin,
    paddingTop: spacing[1],
    paddingBottom: spacing[1],
  },
  tabWidgetOuterFloating: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  tabWidget: {
    flexDirection: 'row' as const,
    alignItems: 'stretch' as const,
    gap: spacing[1],
    borderRadius: 24,
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[0.5],
    borderWidth: 1,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    minHeight: 32,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: spacing[2],
    paddingVertical: 0,
  },
  tabButtonContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
};
