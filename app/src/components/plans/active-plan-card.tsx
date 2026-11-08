import { NativeButton } from '@/components/foundation/native-button';
import EditIcon from '@expo/material-symbols/edit.xml';
import { Card } from '@/components/foundation/card';
import { NativeIconButton } from '@/components/foundation/native-icon-button';
import ShareIcon from '@expo/material-symbols/share.xml';
import { AppText } from '@/components/foundation/app-text';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { SharedProgramBlueprint } from '@/models/feed-models';
import { useAppSelectorWithArg } from '@/store';
import { encryptAndShare } from '@/store/feed';
import { selectProgram } from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

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
    <Card
      actions={
        <>
          <ItemMenu id={id} colors={{ content: colors.primary }} />
          <NativeIconButton
            icon={ShareIcon}
            systemImage="square.and.arrow.up"
            colors={{ content: colors.primary }}
            label={t('generic.share.button')}
            onPress={() =>
              dispatch(
                encryptAndShare({
                  title: t('plan.shared_item.title'),
                  item: new SharedProgramBlueprint(program),
                }),
              )
            }
          />
          <NativeButton
            icon={EditIcon}
            systemImage="pencil"
            label={t('plan.edit.button')}
            onPress={() => push(`/settings/manage-workouts/${id}`)}
          />
        </>
      }
    >
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
          <AppText variant="labelMedium" style={{ letterSpacing: 1 }}>
            {t('plan.active.label').toUpperCase()}
          </AppText>
        </View>

        <View style={{ gap: spacing[0.5] }}>
          <AppText variant="headlineLarge" numberOfLines={2}>
            {program.name}
          </AppText>
          <AppText variant="bodyMedium" style={{ opacity: 0.7 }}>
            {summary}
          </AppText>
        </View>
      </View>
    </Card>
  );
}
