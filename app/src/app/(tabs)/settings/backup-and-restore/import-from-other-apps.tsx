import { SettingsPage } from '@/components/layout/settings-page';
import { EXTERNAL_IMPORT_FORMATS } from '@/services/csv-import';
import { ExternalImportFormat, importFromExternal } from '@/store/settings';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSelect } from '@/components/presentation/foundation/segmented-list-select';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import ImportIcon from '@expo/material-symbols/download.xml';

export default function ImportFromOtherAppsPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [format, setFormat] = useState<ExternalImportFormat>('FitNotes');
  return (
    <SettingsPage
      title={t('backup.import_from_other_apps.title')}
      caption={t('backup.import_from_other_apps.explanation')}
      docs="CsvImport.md"
      actions={
        <PageActions
          primaryKind="commit"
          primary={{
            label: t('generic.import.button'),
            onPress: () => dispatch(importFromExternal({ format })),
            icon: ImportIcon,
            systemImage: 'square.and.arrow.down',
          }}
        />
      }
    >
      <SegmentedGroup>
        <SegmentedListSelect
          label={t('backup.import_from_other_apps.format.label')}
          icon={'descriptionFill'}
          value={format}
          options={EXTERNAL_IMPORT_FORMATS.map((f) => ({ value: f.id, label: t(f.labelKey) }))}
          onChange={setFormat}
        />
      </SegmentedGroup>
    </SettingsPage>
  );
}
