import { SettingsPage } from '@/components/layout/settings-page';
import { exportPlainText, PlaintextExportFormat } from '@/store/settings';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSelect } from '@/components/presentation/foundation/segmented-list-select';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import ExportIcon from '@expo/material-symbols/file_export.xml';

export default function PlainTextExportPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [format, setFormat] = useState<PlaintextExportFormat>('CSV');
  return (
    <SettingsPage
      title={t('backup.plaintext_export.title')}
      caption={t('backup.plaintext_export.explanation')}
      docs="PlaintextExport.md"
      actions={
        <PageActions
          primaryKind="commit"
          primary={{
            label: t('generic.export.button'),
            onPress: () => dispatch(exportPlainText({ format })),
            icon: ExportIcon,
            systemImage: 'square.and.arrow.up',
          }}
        />
      }
    >
      <SegmentedGroup>
        <SegmentedListSelect
          label={t('backup.plaintext_export.format.label')}
          icon={'descriptionFill'}
          value={format}
          options={[
            { value: 'CSV', label: 'CSV' },
            { value: 'JSON', label: 'JSON' },
          ]}
          onChange={setFormat}
        />
      </SegmentedGroup>
    </SettingsPage>
  );
}
