import { useAppTheme } from '@/hooks/useAppTheme';
import { SharedProgramBlueprint } from '@/models/feed-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { showSnackbar } from '@/store/app';
import { encryptAndShare } from '@/store/feed';
import { deleteSavedPlan, exportPlan, savePlan, selectProgram, setActivePlan } from '@/store/program';
import { uuid } from '@/utils/uuid';
import { DateTimeFormatter } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { List, RadioButton } from 'react-native-paper';
import Menu from '@/components/presentation/foundation/menu';
import { useDispatch } from 'react-redux';

interface ProgramListItemProps {
  id: string;
  isFocused: boolean;
}

interface ItemProps {
  id: string;
}

function ItemMenu({ id }: ItemProps) {
  const thisProgram = useAppSelectorWithArg(selectProgram, id);
  const isActive = useAppSelector((x) => x.program.activePlanId) === id;
  const dispatch = useDispatch();
  const { push } = useRouter();
  const { t } = useTranslate();
  return (
    <Menu
      trigger={(open) => <IconButton testID="more-program-btn" onPress={open} icon={'moreHoriz'} />}
      items={[
        {
          label: t('generic.edit.button'),
          icon: 'edit',
          systemImage: 'pencil',
          onPress: () => push(`/settings/manage-workouts/${id}`),
        },
        {
          label: t('generic.remove.button'),
          icon: 'delete',
          systemImage: 'trash',
          disabled: isActive,
          onPress: () => {
            dispatch(
              showSnackbar({
                text: t('plan.deleted.message'),
                action: t('generic.undo.button'),
                dispatchAction: savePlan({
                  programId: id,
                  programBlueprint: thisProgram,
                }),
              }),
            );
            dispatch(deleteSavedPlan({ programId: id }));
          },
        },
        {
          label: t('generic.duplicate.button'),
          icon: 'contentCopy',
          systemImage: 'doc.on.doc',
          onPress: () => dispatch(savePlan({ programId: uuid(), programBlueprint: thisProgram })),
        },
        {
          label: t('generic.share.button'),
          icon: 'share',
          systemImage: 'square.and.arrow.up',
          onPress: () =>
            dispatch(
              encryptAndShare({
                title: t('plan.shared_item.title'),
                item: new SharedProgramBlueprint(thisProgram),
              }),
            ),
        },
        {
          label: t('plan.export.button'),
          icon: 'upload',
          systemImage: 'arrow.up.doc',
          onPress: () => dispatch(exportPlan({ programId: id })),
        },
      ]}
    />
  );
}

export default function ProgramListItem({ id, isFocused }: ProgramListItemProps) {
  const program = useAppSelectorWithArg(selectProgram, id);
  const activeProgramId = useAppSelector((state) => state.program.activePlanId);
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const { push } = useRouter();
  const { colors } = useAppTheme();
  const [focusStyle, setFocusStyle] = useState({});
  useEffect(() => {
    let times = 0;
    let timeout: NodeJS.Timeout;
    const handleTimes = () => {
      times++;
      setFocusStyle(
        times % 2 === 0
          ? {
              backgroundColor: colors.secondaryContainer,
              color: colors.onSecondaryContainer,
            }
          : {},
      );
      if (times < 10) {
        timeout = setTimeout(handleTimes, 150);
      }
    };
    if (isFocused) {
      timeout = setTimeout(handleTimes, 150);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isFocused, colors.onSecondaryContainer, colors.secondaryContainer]);
  return (
    <List.Item
      title={program.name}
      description={t('date.edited_on.label', {
        date: program.lastEdited.format(DateTimeFormatter.ISO_DATE),
      })}
      onLongPress={() => push(`/settings/manage-workouts/${id}`)}
      titleStyle={focusStyle}
      descriptionStyle={focusStyle}
      contentStyle={focusStyle}
      right={() => (
        <View style={{ flexDirection: 'row', alignItems: 'center', ...focusStyle }}>
          <RadioButton
            value={id}
            status={activeProgramId === id ? 'checked' : 'unchecked'}
            onPress={() => dispatch(setActivePlan({ activePlanId: id }))}
          />
          <ItemMenu id={id} />
        </View>
      )}
      onPress={() => {
        if (activeProgramId === id) {
          push(`/settings/manage-workouts/${id}`);
        }
        dispatch(setActivePlan({ activePlanId: id }));
      }}
      style={{}}
    ></List.Item>
  );
}
