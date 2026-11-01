import { Confirmation, ConfirmContext } from '@/components/presentation/foundation/confirm';
import { useTranslate } from '@tolgee/react';
import { useContext } from 'react';

export type ConfirmOptions = Omit<Confirmation, 'okText' | 'cancelText'> & { okText?: string; cancelText?: string };

const toPlainText = (limitedHtml: string) => limitedHtml.replaceAll('<br>', '\n').replace(/<\/?em>/g, '');

export function useConfirm() {
  const { t } = useTranslate();
  const present = useContext(ConfirmContext);
  return ({ message, okText, cancelText, ...rest }: ConfirmOptions) =>
    present({
      ...rest,
      message: toPlainText(message),
      okText: okText ?? t('generic.ok.button'),
      cancelText: cancelText ?? t('generic.cancel.button'),
    });
}
