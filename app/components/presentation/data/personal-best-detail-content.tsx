import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { TitledSection } from '@/components/presentation/stats/titled-section';
import { font, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useAppSelector } from '@/store';
import { selectPreferredWeightUnit } from '@/store/settings';
import { selectSessions } from '@/store/stored-sessions';
import {
  buildPersonalBestOverview,
  formatPersonalBestValue,
  getPersonalBestCategoryLabelKey,
  PersonalBestCategorySummary,
} from '@/utils/personal-bests';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export function PersonalBestDetailContent() {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const { exerciseKey } = useLocalSearchParams<{ exerciseKey: string }>();
  const { dismissTo, push } = useRouter();
  const sessions = useAppSelector(selectSessions);
  const preferredUnit = useAppSelector(selectPreferredWeightUnit);
  const entry = buildPersonalBestOverview(sessions, preferredUnit).entries.find(
    (item) => item.exerciseKey === exerciseKey,
  );

  if (!entry) {
    return (
      <FullHeightScrollView contentContainerStyle={{ padding: spacing[4] }}>
        <Stack.Screen options={{ title: t('progress.pbs.detail.title') }} />
        <EmptyInfo>
          <T keyName="progress.pbs.empty.filtered" />
        </EmptyInfo>
      </FullHeightScrollView>
    );
  }

  const timeline = [...entry.mainCategory.history].reverse();

  return (
    <FullHeightScrollView
      contentContainerStyle={{ gap: spacing[4], padding: spacing[4] }}
    >
      <Stack.Screen options={{ title: entry.exerciseName }} />
      <View style={{ gap: spacing[2] }}>
        <Text style={[font['text-3xl'], { fontWeight: '800' }]}>
          {formatPersonalBestValue(entry.mainCategory.current.value)}
        </Text>
        <Text variant="bodyLarge" style={{ color: colors.onSurfaceVariant }}>
          {t(getPersonalBestCategoryLabelKey(entry.mainCategory.id) as never)}
        </Text>
      </View>
      <TitledSection title={t('progress.pbs.detail.categories')}>
        <SegmentedList
          items={entry.categories}
          itemKey={(item) => item.id}
          renderItem={(item) => <CategorySummaryCard category={item} />}
        />
      </TitledSection>
      <TitledSection title={t('progress.pbs.detail.timeline')}>
        <SegmentedList
          items={timeline}
          itemKey={(item) => item.achievedAt.toString()}
          renderItem={(item, index) => (
            <TimelineRow
              currentValue={item}
              isLatest={index === 0}
              previousValue={timeline[index + 1]}
            />
          )}
        />
      </TitledSection>
      {entry.kind === 'weighted' ? (
        <Button
          icon="barChart"
          mode="contained"
          onPress={() =>
            push(
              `/(tabs)/progress/expanded-weighted-exercise?exerciseName=${encodeURIComponent(entry.exerciseName)}`,
            )
          }
        >
          {t('progress.pbs.detail.open_progress')}
        </Button>
      ) : null}
      <Button mode="text" onPress={() => dismissTo('/(tabs)/progress')}>
        {t('progress.pbs.detail.back_to_progress')}
      </Button>
    </FullHeightScrollView>
  );
}

function CategorySummaryCard({
  category,
}: {
  category: PersonalBestCategorySummary;
}) {
  const { t } = useTranslate();
  const formatDate = useFormatDate();
  const { colors } = useAppTheme();

  return (
    <View style={{ gap: spacing[1] }}>
      <View
        style={{
          alignItems: 'flex-start',
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: spacing[2],
        }}
      >
        <View style={{ flex: 1, gap: spacing[0.5] }}>
          <Text variant="titleSmall">
            {t(getPersonalBestCategoryLabelKey(category.id) as never)}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {formatDate(category.current.achievedOn, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
        <Text
          style={[
            font['text-lg'],
            { fontWeight: '800', color: colors.primary },
          ]}
        >
          {formatPersonalBestValue(category.current.value)}
        </Text>
      </View>
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        {category.previous
          ? t('progress.pbs.detail.previous_best', {
              value: formatPersonalBestValue(category.previous.value),
              date: formatDate(category.previous.achievedOn, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
            })
          : t('progress.pbs.detail.first_best')}
      </Text>
    </View>
  );
}

function TimelineRow({
  currentValue,
  previousValue,
  isLatest,
}: {
  currentValue: PersonalBestCategorySummary['history'][number];
  previousValue?: PersonalBestCategorySummary['history'][number];
  isLatest: boolean;
}) {
  const formatDate = useFormatDate();
  const { colors } = useAppTheme();
  const { t } = useTranslate();

  return (
    <Card mode="contained" style={{ backgroundColor: colors.surfaceContainer }}>
      <Card.Content style={{ gap: spacing[1] }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: spacing[2],
          }}
        >
          <View style={{ gap: spacing[0.5] }}>
            <Text variant="labelMedium">
              {formatDate(currentValue.achievedOn, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: colors.onSurfaceVariant }}
            >
              {isLatest
                ? t('progress.pbs.detail.current_record')
                : t('progress.pbs.detail.record_progression')}
            </Text>
          </View>
          <Text
            style={[
              font['text-lg'],
              { fontWeight: '800', color: colors.primary },
            ]}
          >
            {formatPersonalBestValue(currentValue.value)}
          </Text>
        </View>
        {previousValue ? (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {t('progress.pbs.detail.beat_previous', {
              value: formatPersonalBestValue(previousValue.value),
            })}
          </Text>
        ) : (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            <T keyName="progress.pbs.detail.first_best" />
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}
