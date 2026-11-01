import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import AssignmentIcon from '@expo/material-symbols/assignment.xml';
import { useAppSelector } from '@/store';
import { addMessage } from '@/store/ai-planner';
import { uuid } from '@/utils/uuid';

export function ShareProgramButton({ disabled }: { disabled: boolean }) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const activeProgram = useAppSelector((x) => x.program.savedPrograms[x.program.activePlanId]);

  const share = () => {
    if (!activeProgram) {
      return;
    }
    dispatch(
      addMessage({
        from: 'User',
        id: uuid(),
        type: 'sharedProgram',
        programName: activeProgram.name,
        blueprint: activeProgram,
      }),
    );
  };

  return (
    <NativeIconButton
      variant="outlined"
      icon={AssignmentIcon}
      systemImage="doc.text"
      label={t('ai.share_program.button')}
      disabled={disabled || !activeProgram}
      onPress={share}
    />
  );
}
