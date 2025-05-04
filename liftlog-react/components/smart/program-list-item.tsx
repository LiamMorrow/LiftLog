import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectProgram, setActivePlan } from '@/store/program';
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
  const isActive = useAppSelector((x) => x.program.activeProgramId) === id;
  const [menuVisible, setMenuVisible] = useState(false);
  const { t } = useTranslate();
  // TODO implement actions of itemmenu
  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <IconButton
          data-cy="more-program-btn"
          onPress={() => setMenuVisible(true)}
          icon="more_horiz"
        />
      }
    >
      <Menu.Item
        onPress={() => {
          setMenuVisible(false);
        }}
        leadingIcon="delete"
        disabled={isActive}
        title={t('Remove')}
      />
      <Menu.Item
        title={t('Duplicate')}
        leadingIcon="content_copy"
        onPress={() => {
          setMenuVisible(false);
        }}
      />
      <Menu.Item
        onPress={() => {
          setMenuVisible(false);
        }}
        leadingIcon="share"
        title={t('Share')}
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
