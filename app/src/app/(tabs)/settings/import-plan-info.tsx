import { SettingsPage } from '@/components/layout/settings-page';
import { importPlanFromPicker } from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import FileOpenIcon from '@expo/material-symbols/file_open.xml';

export default function ImportPlanInfoPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();

  return (
    <SettingsPage
      title={t('plan.import.title')}
      caption={t('plan.import.explanation')}
      docs="PlanFileFormat.md"
      actions={
        <PageActions
          primaryKind="commit"
          primary={{
            label: t('plan.import.choose_file.button'),
            onPress: () => dispatch(importPlanFromPicker()),
            icon: FileOpenIcon,
            systemImage: 'folder',
          }}
        />
      }
    />
  );
}
