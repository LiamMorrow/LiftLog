import Button from '@/components/presentation/foundation/button';
import CardActions from '@/components/presentation/foundation/card-actions';
import IconButton from '@/components/presentation/foundation/icon-button';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { SharedProgramBlueprint } from '@/models/feed-models';
import { useAppSelectorWithArg } from '@/store';
import { encryptAndShare } from '@/store/feed';
import { selectProgram } from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { ItemMenu } from './program-list-item';

export function ActivePlanCard({ id }: { id: string }) {
  const program = useAppSelectorWithArg(selectProgram, id);
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const { push } = useRouter();
  const dispatch = useDispatch();

  const days = program.sessions.length;
  const exercises = program.sessions.reduce((total, session) => total + session.exercises.length, 0);
  const summary = [
    t(days === 1 ? 'plan.summary.day' : 'plan.summary.days', { count: days }),
    t(exercises === 1 ? 'plan.summary.exercise' : 'plan.summary.exercises', { count: exercises }),
  ].join(' · ');

  return (
    <Card mode="contained">
      <View style={{ padding: spacing[4], gap: spacing[3] }}>
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: colors.surface,
            borderRadius: rounding.roundedRectangleRadius,
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[1],
          }}
        >
          <SurfaceText font="text-xs" weight="700" style={{ letterSpacing: 1 }}>
            {t('plan.active.label').toUpperCase()}
          </SurfaceText>
        </View>

        <View style={{ gap: spacing[0.5] }}>
          <SurfaceText font="text-3xl" numberOfLines={2}>
            {program.name}
          </SurfaceText>
          <SurfaceText font="text-sm" style={{ opacity: 0.7 }}>
            {summary}
          </SurfaceText>
        </View>
      </View>

      <CardActions style={{ marginTop: spacing[2] }}>
        <ItemMenu id={id} mode="contained" />
        <IconButton
          icon={'share'}
          mode="contained"
          accessibilityLabel={t('generic.share.button')}
          onPress={() =>
            dispatch(
              encryptAndShare({
                title: t('plan.shared_item.title'),
                item: new SharedProgramBlueprint(program),
              }),
            )
          }
        />
        <Button mode="contained" icon={'edit'} onPress={() => push(`/settings/manage-workouts/${id}`)}>
          {t('plan.edit.button')}
        </Button>
      </CardActions>
    </Card>
  );
}
