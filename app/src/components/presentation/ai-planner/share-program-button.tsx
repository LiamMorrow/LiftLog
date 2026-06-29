import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { Tooltip } from 'react-native-paper';
import { useAppSelector } from '@/store';
import { addMessage } from '@/store/ai-planner';
import { uuid } from '@/utils/uuid';
import { ProgramBlueprint } from '@/models/blueprint-models';

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
        blueprint: ProgramBlueprint.fromPOJO(activeProgram),
      }),
    );
  };

  return (
    <Tooltip title={t('ai.share_program.button')}>
      <IconButton mode="outlined" icon={'assignment'} size={35} disabled={disabled || !activeProgram} onPress={share} />
    </Tooltip>
  );
}
