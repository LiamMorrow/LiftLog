import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Form from '@/components/presentation/foundation/form';
import LabelledFormRow from '@/components/presentation/foundation/labelled-form-row';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
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
  const [format, setFormat] = useState<ExternalImportFormat>('CSV');
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
          <View>
            <SurfaceText style={{ textAlign: 'center' }}>
              <T keyName="backup.import_from_other_apps.explanation" />
            </SurfaceText>
          </View>
          <Button onPress={() => openUrl('https://github.com/LiamMorrow/LiftLog/blob/main/docs/CsvImport.md')}>
            <T keyName="generic.read_documentation.button" />
          </Button>
        </Card.Content>
      </Card>
      <Form>
        <LabelledFormRow label={t('backup.import_from_other_apps.format.label')} icon={'descriptionFill'}>
          <Dropdown
            options={[
              { label: 'FitNotes-style CSV', value: 'CSV' },
              { label: 'StrongLifts-style CSV', value: 'StrongLifts' },
            ]}
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
