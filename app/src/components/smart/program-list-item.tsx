import { useAppTheme } from '@/hooks/useAppTheme';
import { SharedProgramBlueprint } from '@/models/feed-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { showSnackbar } from '@/store/app';
import { encryptAndShare } from '@/store/feed';
import { deleteSavedPlan, exportPlan, savePlan, selectProgram } from '@/store/program';
import { uuid } from '@/utils/uuid';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import IconButton from '@/components/presentation/foundation/icon-button';
import { SegmentedListRowAction, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import Menu from '@/components/presentation/foundation/menu';
import { useDispatch } from 'react-redux';
import Edit from '@expo/material-symbols/edit.xml';
import Delete from '@expo/material-symbols/delete.xml';
import ContentCopy from '@expo/material-symbols/content_copy.xml';
import Share from '@expo/material-symbols/share.xml';
import Upload from '@expo/material-symbols/upload.xml';

interface ProgramListItemProps {
  id: string;
  isFocused: boolean;
  onSelect: () => void;
}

interface ItemProps {
  id: string;
  mode?: 'contained' | 'contained-tonal' | 'outlined';
}

export function ItemMenu({ id, mode }: ItemProps) {
  const thisProgram = useAppSelectorWithArg(selectProgram, id);
  const isActive = useAppSelector((x) => x.program.activePlanId) === id;
  const dispatch = useDispatch();
  const { push } = useRouter();
  const { t } = useTranslate();
  return (
    <Menu
      trigger={(open) => <IconButton testID="more-program-btn" mode={mode} onPress={open} icon={'moreHoriz'} />}
      items={[
        {
          label: t('generic.edit.button'),
          icon: Edit,
          systemImage: 'pencil',
          onPress: () => push(`/settings/manage-workouts/${id}`),
        },
        {
          label: t('generic.remove.button'),
          icon: Delete,
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
          icon: ContentCopy,
          systemImage: 'doc.on.doc',
          onPress: () => dispatch(savePlan({ programId: uuid(), programBlueprint: thisProgram })),
        },
        {
          label: t('generic.share.button'),
          icon: Share,
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
          icon: Upload,
          systemImage: 'arrow.up.doc',
          onPress: () => dispatch(exportPlan({ programId: id })),
        },
      ]}
    />
  );
}

export default function ProgramListItem({ id, isFocused, onSelect }: ProgramListItemProps) {
  const program = useAppSelectorWithArg(selectProgram, id);
  const { push } = useRouter();
  const { colors } = useAppTheme();
  const [focusStyle, setFocusStyle] = useState({});
  useEffect(() => {
    let times = 0;
    let timeout: NodeJS.Timeout;
    const handleTimes = () => {
      times++;
      setFocusStyle(times % 2 === 0 ? { backgroundColor: colors.secondaryContainer } : {});
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
  }, [isFocused, colors.secondaryContainer]);
  return (
    <SegmentListFormElement
      label={program.name}
      style={focusStyle}
      onLongPress={() => push(`/settings/manage-workouts/${id}`)}
      right={
        <SegmentedListRowAction>
          <ItemMenu id={id} />
        </SegmentedListRowAction>
      }
      onPress={onSelect}
    />
  );
}
