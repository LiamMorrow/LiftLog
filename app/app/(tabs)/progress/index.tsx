import { ExerciseStatsContent } from '@/components/presentation/data/exercise-stats-content';
import { HistoryContent } from '@/components/presentation/data/history-content';
import { PersonalBestsContent } from '@/components/presentation/data/personal-bests-content';
import {
  ScrollProvider,
  useScroll,
  useScrollHeaderColor,
} from '@/hooks/useScrollListener';
import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';

export default function ProgressPage() {
  const { t } = useTranslate();
  const { setScrolled } = useScroll();
  const headerColor = useScrollHeaderColor();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabScrolls, setTabScrolls] = useState<Record<number, boolean>>({});

  const setTabScrolled = (isScrolled: boolean, tabIndex: number) => {
    if (tabScrolls[tabIndex] !== isScrolled) {
      setTabScrolls((current) => ({ ...current, [tabIndex]: isScrolled }));
    }
  };

  useEffect(() => {
    setScrolled(!!tabScrolls[activeTabIndex]);
  }, [activeTabIndex, setScrolled, tabScrolls]);

  return (
    <>
      <Stack.Screen options={{ title: t('progress.title') }} />
      <TabsProvider onChangeIndex={setActiveTabIndex}>
        <Tabs
          tabHeaderStyle={{
            backgroundColor: headerColor,
            marginBottom: spacing[1],
          }}
          style={{ backgroundColor: 'transparent' }}
        >
          <TabScreen label={t('exercise.exercises.title')}>
            <ScrollProvider
              isScrolled={!!tabScrolls[activeTabIndex]}
              setScrolled={(scrolled) => setTabScrolled(scrolled, 0)}
            >
              <ExerciseStatsContent
                onScroll={(event) =>
                  setTabScrolled(event.nativeEvent.contentOffset.y > 0, 0)
                }
                contentContainerStyle={{
                  gap: spacing[2],
                  paddingHorizontal: spacing.pageHorizontalMargin,
                  paddingBottom: spacing[6],
                }}
              />
            </ScrollProvider>
          </TabScreen>
          <TabScreen label={t('progress.pbs.title')}>
            <ScrollProvider
              isScrolled={!!tabScrolls[activeTabIndex]}
              setScrolled={(scrolled) => setTabScrolled(scrolled, 1)}
            >
              <PersonalBestsContent
                onScroll={(event) =>
                  setTabScrolled(event.nativeEvent.contentOffset.y > 0, 1)
                }
                contentContainerStyle={{
                  gap: spacing[4],
                  paddingHorizontal: spacing.pageHorizontalMargin,
                  paddingBottom: spacing[6],
                }}
              />
            </ScrollProvider>
          </TabScreen>
          <TabScreen label={t('generic.history.title')}>
            <ScrollProvider
              isScrolled={!!tabScrolls[activeTabIndex]}
              setScrolled={(scrolled) => setTabScrolled(scrolled, 2)}
            >
              <HistoryContent
                onScroll={(event) =>
                  setTabScrolled(event.nativeEvent.contentOffset.y > 0, 2)
                }
                contentContainerStyle={{
                  gap: spacing[4],
                  paddingHorizontal: spacing.pageHorizontalMargin,
                  paddingBottom: spacing[6],
                }}
              />
            </ScrollProvider>
          </TabScreen>
        </Tabs>
      </TabsProvider>
    </>
  );
}
