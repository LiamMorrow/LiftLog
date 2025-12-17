import { AccordionItem } from '@/components/presentation/accordion-item';
import ExerciseMuscleSelector from '@/components/presentation/exercise-muscle-selector';
import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Searchbar, Card } from 'react-native-paper';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';

export default function ExerciseSearchAndFilters({
  searchText,
  setSearchText,
  muscleFilters,
  setMuscleFilters,
}: {
  searchText: string;
  setSearchText: (text: string) => void;
  muscleFilters: string[];
  setMuscleFilters: (muscles: string[]) => void;
}) {
  const { t } = useTranslate();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const selectedFiltersSubtitle =
    muscleFilters.join(', ') || 'No filters applied';

  return (
    <View style={{ gap: spacing[2] }}>
      <Searchbar
        placeholder={t('generic.search.button')}
        value={searchText}
        onChangeText={setSearchText}
        autoCorrect={false}
        style={{ marginHorizontal: spacing.pageHorizontalMargin }}
        testID="exercise-search-input"
      />

      <Card
        mode="contained"
        style={{ marginHorizontal: spacing.pageHorizontalMargin }}
      >
        <Card.Title
          title={t('generic.filters.title')}
          subtitle={selectedFiltersSubtitle}
          right={() => (
            <IconButton
              icon={filtersExpanded ? 'expandCircleUp' : 'expandCircleDown'}
              animated
              testID="expand-filters-btn"
              mode="contained-tonal"
              onPress={() => {
                setFiltersExpanded(!filtersExpanded);
              }}
            />
          )}
        />
        <Card.Content>
          <AccordionItem isExpanded={filtersExpanded}>
            <ExerciseMuscleSelector
              muscles={muscleFilters}
              onChange={setMuscleFilters}
            />
          </AccordionItem>
        </Card.Content>
      </Card>
    </View>
  );
}
