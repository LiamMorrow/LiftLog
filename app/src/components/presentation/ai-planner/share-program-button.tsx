import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';
import IconButton from '@/components/presentation/foundation/icon-button';
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
    <IconButton
      mode="outlined"
      icon={'assignment'}
      accessibilityLabel={t('ai.share_program.button')}
      disabled={disabled || !activeProgram}
      onPress={share}
    />
  );
}
