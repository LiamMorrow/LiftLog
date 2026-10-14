import Icon from '@/components/presentation/foundation/icon';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { openUrl } from '@/utils/open-url';
import { useTranslate } from '@tolgee/react';

const docsBaseUrl = 'https://github.com/LiamMorrow/LiftLog/blob/main/docs/';

export function DocumentationRow(props: { doc: string }) {
  const { t } = useTranslate();
  return (
    <SegmentedGroup>
      <SegmentListFormElement
        label={t('generic.read_documentation.button')}
        icon={'description'}
        onPress={() => openUrl(docsBaseUrl + props.doc)}
        right={<Icon source="openInBrowser" size={20} />}
      />
    </SegmentedGroup>
  );
}
