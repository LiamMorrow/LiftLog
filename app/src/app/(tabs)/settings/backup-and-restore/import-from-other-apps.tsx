import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Form from '@/components/presentation/foundation/form';
import LabelledFormRow from '@/components/presentation/foundation/labelled-form-row';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import { spacing } from '@/hooks/useAppTheme';
import { EXTERNAL_IMPORT_FORMATS } from '@/services/csv-import';
import { ExternalImportFormat, importFromExternal } from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Card } from 'react-native-paper';
import Button from '@/components/presentation/foundation/button';
import { Dropdown } from 'react-native-paper-dropdown';
import { useDispatch } from 'react-redux';

export default function ImportFromOtherAppsPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [format, setFormat] = useState<ExternalImportFormat>('FitNotes');
  const importData = () => {
    dispatch(importFromExternal({ format }));
  };
  const openUrl = (url: string) => {
    void Linking.canOpenURL(url).then(() => Linking.openURL(url));
  };
  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('backup.import_from_other_apps.title') }} />
      <Card mode="contained" style={{ marginHorizontal: spacing[6], marginBottom: spacing[4] }}>
        <Card.Content>
          <LimitedHtml style={{ textAlign: 'center' }} value={t('backup.import_from_other_apps.explanation')} />
          <Button onPress={() => openUrl('https://github.com/LiamMorrow/LiftLog/blob/main/docs/CsvImport.md')}>
            <T keyName="generic.read_documentation.button" />
          </Button>
        </Card.Content>
      </Card>
      <Form>
        <LabelledFormRow label={t('backup.import_from_other_apps.format.label')} icon={'descriptionFill'}>
          <Dropdown
            options={EXTERNAL_IMPORT_FORMATS.map((f) => ({
              label: t(f.labelKey),
              value: f.id,
            }))}
            value={format}
            mode="outlined"
            onSelect={(s) => s && setFormat(s as ExternalImportFormat)}
          ></Dropdown>
        </LabelledFormRow>
      </Form>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: spacing[4],
          margin: spacing[6],
        }}
      >
        <Button mode="contained" onPress={importData}>
          <T keyName="generic.import.button" />
        </Button>
      </View>
    </FullHeightScrollView>
  );
}
