import { useAppTheme } from '@/hooks/useAppTheme';
import { SharedProgramBlueprint } from '@/models/feed-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { showSnackbar } from '@/store/app';
import { encryptAndShare } from '@/store/feed';
import {
  deleteSavedPlan,
  savePlan,
  selectProgram,
  setActivePlan,
} from '@/store/program';
import { uuid } from '@/utils/uuid';
import { DateTimeFormatter } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import { List, Menu, RadioButton } from 'react-native-paper';
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
  const isActive = useAppSelector((x) => x.program.activeProgramId) === id;
  const [menuVisible, setMenuVisible] = useState(false);
  const dispatch = useDispatch();
  const { push } = useRouter();
  const { t } = useTranslate();
  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <IconButton
          testID="more-program-btn"
          onPress={() => setMenuVisible(true)}
          icon={'moreHoriz'}
        />
      }
    >
      <Menu.Item
        onPress={() => {
          push(`/settings/manage-workouts/${id}`);
          setMenuVisible(false);
        }}
        leadingIcon={'edit'}
        title={t('generic.edit.button')}
      />
      <Menu.Item
        onPress={() => {
          if (!isActive) {
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
          }
          setMenuVisible(false);
        }}
        leadingIcon={'delete'}
        disabled={isActive}
        title={t('generic.remove.button')}
      />
      <Menu.Item
        title={t('generic.duplicate.button')}
        leadingIcon={'contentCopy'}
        onPress={() => {
          setMenuVisible(false);
          dispatch(
            savePlan({ programId: uuid(), programBlueprint: thisProgram }),
          );
        }}
      />
      <Menu.Item
        leadingIcon={'share'}
        title={t('generic.share.button')}
        onPress={() => {
          setMenuVisible(false);
          dispatch(encryptAndShare(new SharedProgramBlueprint(thisProgram)));
        }}
      />
    </Menu>
  );
}

export default function ProgramListItem({
  id,
  isFocused,
}: ProgramListItemProps) {
  const program = useAppSelectorWithArg(selectProgram, id);
  const activeProgramId = useAppSelector(
    (state) => state.program.activeProgramId,
  );
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const { push } = useRouter();
  const { colors } = useAppTheme();
  const [focusStyle, setFocusStyle] = useState({});
  useEffect(() => {
    let times = 0;
    let timeout: number = 0;
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
        <View
          style={{ flexDirection: 'row', alignItems: 'center', ...focusStyle }}
        >
          <RadioButton
            value={id}
            status={activeProgramId === id ? 'checked' : 'unchecked'}
            onPress={() => dispatch(setActivePlan({ programId: id }))}
          />
          <ItemMenu id={id} />
        </View>
      )}
      onPress={() => {
        if (activeProgramId === id) {
          push(`/settings/manage-workouts/${id}`);
        }
        dispatch(setActivePlan({ programId: id }));
      }}
      style={{}}
    ></List.Item>
  );
}
