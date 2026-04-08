import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import SelectButton, {
  SelectButtonOption,
} from '@/components/presentation/foundation/select-button';
import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import { TitledSection } from '@/components/presentation/stats/titled-section';
import { font, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useAppSelector } from '@/store';
import { selectSessions } from '@/store/stored-sessions';
import { selectPreferredWeightUnit } from '@/store/settings';
import {
  buildPersonalBestOverview,
  filterAndSortPersonalBestEntries,
  formatPersonalBestValue,
  getPersonalBestCategoryLabelKey,
  PersonalBestFilter,
  PersonalBestListEntry,
  PersonalBestSort,
} from '@/utils/personal-bests';
import { T, useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useState, ReactNode } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { Card, Chip, SegmentedButtons, Text } from 'react-native-paper';

const filterOptions: SelectButtonOption<PersonalBestSort>[] = [
  { value: 'most-recent', label: 'Most recent' },
  { value: 'heaviest', label: 'Heaviest' },
  { value: 'biggest-improvement', label: 'Biggest improvement' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

export function PersonalBestsContent(props: {
  header?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  const { t } = useTranslate();
  const { push } = useRouter();
  const sessions = useAppSelector(selectSessions);
  const preferredUnit = useAppSelector(selectPreferredWeightUnit);
  const overview = buildPersonalBestOverview(sessions, preferredUnit);
  const [filter, setFilter] = useState<PersonalBestFilter>('all');
  const [sort, setSort] = useState<PersonalBestSort>('most-recent');
  const filteredEntries = filterAndSortPersonalBestEntries(
    overview.entries,
    filter,
    sort,
  );

  return (
    <FullHeightScrollView
      contentContainerStyle={props.contentContainerStyle}
      {...(props.onScroll ? { onScroll: props.onScroll } : {})}
    >
      {props.header}
      <PersonalBestSummaryRow overview={overview} />
      <TitledSection
        title={t('progress.pbs.list.title')}
        titleRight={
          <SelectButton
            buttonProps={{ mode: 'text' }}
            onChange={setSort}
            options={filterOptions.map((option) => ({
              ...option,
              label: t(`progress.pbs.sort.${option.value}`),
            }))}
            renderLabel={(value) =>
              t('progress.pbs.sort.button', {
                value: t(`progress.pbs.sort.${value}`),
              })
            }
            value={sort}
          />
        }
      >
        <FilterBar filter={filter} setFilter={setFilter} />
        {overview.entries.length === 0 ? (
          <EmptyInfo>
            <T keyName="progress.pbs.empty.message" />
          </EmptyInfo>
        ) : filteredEntries.length === 0 ? (
          <EmptyInfo>
            <T keyName="progress.pbs.empty.filtered" />
          </EmptyInfo>
        ) : (
          <SegmentedList
            items={filteredEntries}
            itemKey={(item) => item.exerciseKey}
            onItemPress={(item) =>
              push(
                `/(tabs)/progress/personal-best?exerciseKey=${encodeURIComponent(item.exerciseKey)}`,
              )
            }
            renderItem={(item) => <PersonalBestRow entry={item} />}
          />
        )}
      </TitledSection>
    </FullHeightScrollView>
  );
}

function PersonalBestSummaryRow({
  overview,
}: {
  overview: ReturnType<typeof buildPersonalBestOverview>;
}) {
  const { t } = useTranslate();

  return (
    <View style={{ gap: spacing[2] }}>
      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        <SummaryCard
          title={t('progress.pbs.summary.total')}
          value={overview.summary.totalPbs.toString()}
        />
        <SummaryCard
          title={t('progress.pbs.summary.recent')}
          value={overview.summary.recentPbs.toString()}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        <SummaryCard
          title={t('progress.pbs.summary.strongest')}
          value={
            overview.summary.strongestLift
              ? `${overview.summary.strongestLift.exerciseName} · ${formatPersonalBestValue(
                  overview.summary.strongestLift.mainCategory.current.value,
                )}`
              : '-'
          }
        />
        <SummaryCard
          title={t('progress.pbs.summary.improved')}
          value={
            overview.summary.mostImprovedLift
              ? `${overview.summary.mostImprovedLift.exerciseName} · ${
                  overview.summary.mostImprovedLift.improvementDisplay ?? ''
                }`
              : '-'
          }
        />
      </View>
    </View>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <Card
      mode="contained"
      style={{ flex: 1, backgroundColor: colors.surfaceContainer }}
    >
      <Card.Content style={{ gap: spacing[1], minHeight: 92 }}>
        <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
          {title}
        </Text>
        <Text style={[font['text-sm'], { fontWeight: '700' }]}>{value}</Text>
      </Card.Content>
    </Card>
  );
}

function FilterBar({
  filter,
  setFilter,
}: {
  filter: PersonalBestFilter;
  setFilter: (value: PersonalBestFilter) => void;
}) {
  const { t } = useTranslate();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing[1], paddingBottom: spacing[1] }}
    >
      <SegmentedButtons
        density="small"
        onValueChange={(value) => setFilter(value as PersonalBestFilter)}
        value={filter}
        buttons={['all', 'strength', 'volume', 'reps', 'cardio', 'recent'].map(
          (value) => ({
            value,
            label: t(`progress.pbs.filter.${value}` as never),
          }),
        )}
      />
    </ScrollView>
  );
}

function PersonalBestRow({ entry }: { entry: PersonalBestListEntry }) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const formatDate = useFormatDate();

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
          <Text variant="titleSmall">{entry.exerciseName}</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {t(getPersonalBestCategoryLabelKey(entry.mainCategory.id) as never)}{' '}
            ·{' '}
            {formatDate(entry.mainCategory.current.achievedOn, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
        <Text
          style={[
            font['text-xl'],
            { color: colors.primary, fontWeight: '800', textAlign: 'right' },
          ]}
        >
          {formatPersonalBestValue(entry.mainCategory.current.value)}
        </Text>
      </View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: spacing[2],
        }}
      >
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {entry.improvementDisplay
            ? `${t('progress.pbs.improved.label')} ${entry.improvementDisplay}`
            : t('progress.pbs.best.label')}
        </Text>
        {entry.isRecent ? (
          <Chip compact selected>
            {t('progress.pbs.badge.new')}
          </Chip>
        ) : null}
      </View>
    </View>
  );
}
