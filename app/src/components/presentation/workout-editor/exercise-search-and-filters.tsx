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
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import ExpandCircleUpIcon from '@expo/material-symbols/expand_circle_up.xml';
import ExpandCircleDownIcon from '@expo/material-symbols/expand_circle_down.xml';

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
          <NativeIconButton
            icon={filtersExpanded ? ExpandCircleUpIcon : ExpandCircleDownIcon}
            systemImage={filtersExpanded ? 'chevron.up.circle' : 'chevron.down.circle'}
            testID="expand-filters-btn"
            variant="tonal"
            label={t(filtersExpanded ? 'generic.collapse.button' : 'generic.expand.button')}
            onPress={() => setFiltersExpanded(!filtersExpanded)}
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
