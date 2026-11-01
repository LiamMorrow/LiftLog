import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import DescriptionIcon from '@expo/material-symbols/description.xml';
import OpenInBrowserIcon from '@expo/material-symbols/open_in_browser.xml';
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
        icon={DescriptionIcon}
        systemImage="doc.text"
        onPress={() => openUrl(docsBaseUrl + props.doc)}
        right={<NativeIcon icon={OpenInBrowserIcon} systemImage="arrow.up.right.square" size={20} />}
      />
    </SegmentedGroup>
  );
}
