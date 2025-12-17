import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import LabelledForm from '@/components/presentation/labelled-form';
import LabelledFormRow from '@/components/presentation/labelled-form-row';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { exportPlainText, PlaintextExportFormat } from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Card } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
import { Dropdown } from 'react-native-paper-dropdown';
import { useDispatch } from 'react-redux';

export default function PlainTextExportPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [format, setFormat] = useState<PlaintextExportFormat>('CSV');
  const exportData = () => {
    dispatch(exportPlainText({ format }));
  };
  const openUrl = (url: string) => {
    void Linking.canOpenURL(url).then(() => Linking.openURL(url));
  };
  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('backup.plaintext_export.title') }} />
      <Card
        mode="contained"
        style={{ marginHorizontal: spacing[6], marginBottom: spacing[4] }}
      >
        <Card.Content>
          <View>
            <SurfaceText style={{ textAlign: 'center' }}>
              <T keyName="backup.plaintext_export.explanation" />
            </SurfaceText>
          </View>
          <Button
            onPress={() =>
              openUrl(
                'https://github.com/LiamMorrow/LiftLog/blob/main/docs/PlaintextExport.md',
              )
            }
          >
            <T keyName="generic.read_documentation.button" />
          </Button>
        </Card.Content>
      </Card>
      <LabelledForm>
        <LabelledFormRow
          label={t('backup.plaintext_export.format.label')}
          icon={'descriptionFill'}
        >
          <Dropdown
            options={[
              { label: 'CSV', value: 'CSV' },
              { label: 'JSON', value: 'JSON' },
            ]}
            value={format}
            mode="outlined"
            onSelect={(s) => s && setFormat(s as PlaintextExportFormat)}
          ></Dropdown>
        </LabelledFormRow>
      </LabelledForm>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: spacing[4],
          margin: spacing[6],
        }}
      >
        <Button mode="contained" onPress={exportData}>
          <T keyName="generic.export.button" />
        </Button>
      </View>
    </FullHeightScrollView>
  );
}
