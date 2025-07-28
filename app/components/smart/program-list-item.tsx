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

import { IconButton, List, Menu, RadioButton } from 'react-native-paper';
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
        title={t('Edit')}
      />
      <Menu.Item
        onPress={() => {
          if (!isActive) {
            dispatch(
              showSnackbar({
                text: t('PlanDeleted'),
                action: t('Undo'),
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
        title={t('Remove')}
      />
      <Menu.Item
        title={t('Duplicate')}
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
        title={t('Share')}
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
      description={t('EditedOn{Date}', {
        0: program.lastEdited.format(DateTimeFormatter.ISO_DATE),
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
