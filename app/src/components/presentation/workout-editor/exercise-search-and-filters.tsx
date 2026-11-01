import { AccordionItem } from '@/components/presentation/foundation/accordion-item';
import { Card, CardContent } from '@/components/presentation/foundation/card';
import { AppText } from '@/components/presentation/foundation/app-text';
import ExerciseMuscleSelector from '@/components/presentation/workout-editor/exercise-muscle-selector';
import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { translateExerciseMeta } from '@/utils/exercise-meta';
import { useState } from 'react';
import { View } from 'react-native';

import { SearchField } from '@/components/presentation/foundation/search-field';
import IconButton from '@/components/presentation/foundation/icon-button';

export default function ExerciseSearchAndFilters({
  searchText,
  setSearchText,
  muscleFilters,
  setMuscleFilters,
  autoFocus,
}: {
  autoFocus?: boolean;
  searchText: string;
  setSearchText: (text: string) => void;
  muscleFilters: string[];
  setMuscleFilters: (muscles: string[]) => void;
}) {
  const { t } = useTranslate();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const selectedFiltersSubtitle =
    muscleFilters.map((m) => translateExerciseMeta(t, 'muscle', m)).join(', ') || 'No filters applied';

  return (
    <View style={{ gap: spacing[2] }}>
      <SearchField
        value={searchText}
        selectTextOnFocus
        autoFocus={autoFocus}
        onChangeText={setSearchText}
        autoCapitalize={'words'}
        autoCorrect={false}
        style={{ marginHorizontal: spacing.pageHorizontalMargin }}
        testID="exercise-search-input"
      />

      <Card style={{ marginHorizontal: spacing.pageHorizontalMargin }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 72, paddingInlineStart: spacing[4] }}>
          <View style={{ flex: 1, paddingInlineEnd: spacing[4] }}>
            <AppText variant="bodyLarge" numberOfLines={1}>
              {t('generic.filters.title')}
            </AppText>
            <AppText variant="bodyMedium" numberOfLines={1}>
              {selectedFiltersSubtitle}
            </AppText>
          </View>
          <IconButton
            icon={filtersExpanded ? 'expandCircleUp' : 'expandCircleDown'}
            animated
            testID="expand-filters-btn"
            mode="contained-tonal"
            onPress={() => {
              setFiltersExpanded(!filtersExpanded);
            }}
          />
        </View>
        <CardContent>
          <AccordionItem isExpanded={filtersExpanded}>
            <ExerciseMuscleSelector muscles={muscleFilters} onChange={setMuscleFilters} />
          </AccordionItem>
        </CardContent>
      </Card>
    </View>
  );
}
