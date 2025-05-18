import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
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
import { T, useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  IconButton,
  List,
  Menu,
  TouchableRipple,
} from 'react-native-paper';
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
  const { t } = useTranslate();
  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <IconButton
          data-cy="more-program-btn"
          onPress={() => setMenuVisible(true)}
          icon={'moreHoriz'}
        />
      }
    >
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

function ActiveBadge({ id }: ItemProps) {
  const isActive = useAppSelector((x) => x.program.activeProgramId) === id;
  const mode = isActive ? 'contained' : 'text';
  const text = isActive ? 'Active' : 'UseWorkout';
  const dispatch = useDispatch();
  const { colors } = useAppTheme();
  if (isActive) {
    return (
      <View
        style={{
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 1000,
          backgroundColor: colors.secondaryContainer,
        }}
      >
        <TouchableRipple onPress={() => {}}>
          <SurfaceText
            color="onSecondaryContainer"
            style={{
              fontWeight: 'semibold',
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
            }}
          >
            Active
          </SurfaceText>
        </TouchableRipple>
      </View>
    );
  }

  return (
    <Button
      mode={mode}
      onPress={() => {
        dispatch(setActivePlan({ programId: id }));
      }}
    >
      <T keyName={text} />
    </Button>
  );
}

export default function ProgramListItem({
  id,
  isFocused,
}: ProgramListItemProps) {
  const program = useAppSelectorWithArg(selectProgram, id);
  const { push } = useRouter();
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const focusStyle = isFocused
    ? {
        backgroundColor: colors.secondaryContainer,
        color: colors.onSecondaryContainer,
      }
    : {};
  return (
    <List.Item
      title={program.name}
      description={t('EditedOn{Date}', {
        0: program.lastEdited.format(DateTimeFormatter.ISO_DATE),
      })}
      titleStyle={focusStyle}
      descriptionStyle={focusStyle}
      contentStyle={focusStyle}
      right={() => (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', ...focusStyle }}
        >
          <ActiveBadge id={id} />
          <ItemMenu id={id} />
        </View>
      )}
      onPress={() => {
        push(`/settings/manage-workouts/${id}`);
      }}
      style={{}}
    ></List.Item>
  );
}
