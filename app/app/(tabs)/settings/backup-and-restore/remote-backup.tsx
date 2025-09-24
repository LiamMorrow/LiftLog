import EmptyInfo from '@/components/presentation/empty-info';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import LabelledForm from '@/components/presentation/labelled-form';
import LabelledFormRow from '@/components/presentation/labelled-form-row';
import LimitedHtml from '@/components/presentation/limited-html';
import ListSwitch from '@/components/presentation/list-switch';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { showSnackbar } from '@/store/app';
import { executeRemoteBackup, setRemoteBackupSettings } from '@/store/settings';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Card, HelperText, TextInput } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
import { useDispatch } from 'react-redux';

export default function RemoteBackupPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { apiKey, endpoint, includeFeedAccount } = useAppSelector(
    (s) => s.settings.remoteBackupSettings,
  );
  const openUrl = (url: string) => {
    void Linking.canOpenURL(url).then(() => Linking.openURL(url));
  };
  const [endpointValue, setEndpoint] = useState(endpoint);
  const [apiKeyValue, setApiKey] = useState(apiKey);
  const [includeFeedAccountValue, setIncludeFeedAccount] =
    useState(includeFeedAccount);
  const [endpointError, setEndpointError] = useState('');

  const updateEndpoint = (e: string) => {
    if (e && !e.startsWith('https://')) {
      setEndpointError('Endpoint must start with https://');
    } else {
      setEndpointError('');
    }
    setEndpoint(e);
  };

  const save = () => {
    if (endpointError) {
      return;
    }
    dispatch(
      setRemoteBackupSettings({
        endpoint: endpointValue,
        apiKey: apiKeyValue,
        includeFeedAccount: includeFeedAccountValue,
      }),
    );
    dispatch(
      showSnackbar({
        text: t('SettingsSaved'),
        duration: 2000,
      }),
    );
  };

  const test = () => {
    dispatch(
      executeRemoteBackup({
        settings: {
          endpoint: endpointValue,
          apiKey: apiKeyValue,
          includeFeedAccount: includeFeedAccountValue,
        },
        force: true,
      }),
    );
  };

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('AutomaticRemoteBackup') }} />
      <Card
        mode="contained"
        style={{ marginHorizontal: spacing[6], marginBottom: spacing[4] }}
      >
        <Card.Content>
          <EmptyInfo>
            <LimitedHtml
              style={{ textAlign: 'center' }}
              value={t('RemoteBackupDescription')}
            />
          </EmptyInfo>

          <Button
            onPress={() =>
              openUrl(
                'https://github.com/LiamMorrow/LiftLog/blob/main/docs/RemoteBackup.md',
              )
            }
          >
            <T keyName="ReadDocumentation" />
          </Button>
        </Card.Content>
      </Card>
      <LabelledForm>
        <LabelledFormRow label={t('Endpoint')} icon={'public'}>
          <TextInput
            mode="outlined"
            placeholder="https://example.com/backup"
            value={endpointValue}
            error={!!endpointError}
            onChangeText={updateEndpoint}
            autoCorrect={false}
          />
          <HelperText type="error">{endpointError}</HelperText>
        </LabelledFormRow>
        <LabelledFormRow label={t('ApiKey')} icon={'vpnKey'}>
          <TextInput
            mode="outlined"
            value={apiKeyValue}
            onChangeText={setApiKey}
            autoCorrect={false}
          />
          <HelperText type="error">{endpointError}</HelperText>
        </LabelledFormRow>
        <ListSwitch
          headline={t('BackupFeedAccount')}
          supportingText={t('BackupFeedAccountSubtitle')}
          value={includeFeedAccountValue}
          onValueChange={setIncludeFeedAccount}
        />
      </LabelledForm>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: spacing[4],
          margin: spacing[6],
        }}
      >
        <Button disabled={!!endpointError} onPress={test}>
          <T keyName="Test" />
        </Button>
        <Button disabled={!!endpointError} onPress={save}>
          <T keyName="Save" />
        </Button>
      </View>
    </FullHeightScrollView>
  );
}
