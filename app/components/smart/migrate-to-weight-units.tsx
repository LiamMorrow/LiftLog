import FullScreenDialog from '@/components/presentation/full-screen-dialog';
import Button from '@/components/presentation/gesture-wrappers/button';
import { AppIconSource } from '@/components/presentation/ms-icon-source';
import SelectButton from '@/components/presentation/select-button';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import {
  migrateExerciseWeights,
  setExercisesRequiringWeightMigration,
  updateExerciseRequiringWeightMigration,
} from '@/store/stored-sessions';
import { FlashList } from '@shopify/flash-list';
import { useTranslate } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Icon, List, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export function MigrateToWeightUnitsWizard() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const exercisesRequiringWeightMigration = useAppSelector(
    (x) => x.storedSessions.exercisesRequiringWeightMigration,
  );
  useEffect(() => {
    setOpen(!!exercisesRequiringWeightMigration.length);
  }, [exercisesRequiringWeightMigration]);
  return (
    <FullScreenDialog
      open={open}
      noScroll
      onClose={() => {
        setOpen(false);
      }}
      title={t('weight.migrate.button')}
      action={t('generic.save.button')}
      onAction={() => {
        dispatch(migrateExerciseWeights());
      }}
    >
      <FlashList
        style={{ flex: 1, marginHorizontal: -spacing.pageHorizontalMargin }}
        ListHeaderComponent={
          <View
            style={{
              alignItems: 'center',
              gap: spacing[2],
              paddingHorizontal: spacing.pageHorizontalMargin,
              paddingBottom: spacing[4],
            }}
          >
            <Icon source={'weight' satisfies AppIconSource} size={48} />
            <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
              {t('weight.migrate.explanation')}
              {t('weight.migrate.prompt')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                gap: spacing[4],
                paddingTop: spacing[4],
              }}
            >
              <Button
                mode="contained"
                testID="all-kilograms"
                onPress={() =>
                  dispatch(
                    setExercisesRequiringWeightMigration(
                      exercisesRequiringWeightMigration.map((ex) => ({
                        ...ex,
                        unit: 'kilograms',
                      })),
                    ),
                  )
                }
              >
                {t('weight.all_kilograms.button')}
              </Button>
              <Button
                mode="contained"
                onPress={() =>
                  dispatch(
                    setExercisesRequiringWeightMigration(
                      exercisesRequiringWeightMigration.map((ex) => ({
                        ...ex,
                        unit: 'pounds',
                      })),
                    ),
                  )
                }
              >
                {t('weight.all_pounds.button')}
              </Button>
            </View>
          </View>
        }
        data={exercisesRequiringWeightMigration}
        renderItem={(d) => (
          <List.Item
            title={d.item.name || 'Empty exercise name'}
            right={() => (
              <SelectButton
                options={[
                  {
                    label: 'kg',
                    value: 'kilograms',
                  },
                  {
                    label: 'lbs',
                    value: 'pounds',
                  },
                  {
                    label: 'Unset',
                    value: 'nil',
                    disabledAndHidden: true,
                  },
                ]}
                value={d.item.unit}
                onChange={(unit) =>
                  dispatch(
                    updateExerciseRequiringWeightMigration({
                      name: d.item.name,
                      unit,
                    }),
                  )
                }
              />
            )}
          />
        )}
      />
    </FullScreenDialog>
  );
}
