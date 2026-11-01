import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Form from '@/components/presentation/foundation/form';
import IconButton from '@/components/presentation/foundation/icon-button';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListTextInput } from '@/components/presentation/foundation/segmented-list-text-input';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import { spacing } from '@/hooks/useAppTheme';
import {
  Backend,
  BackendHeader,
  BackendId,
  basicAuthHeaderValue,
  commonHeaderNames,
  isSecretHeader,
  parseBasicAuthHeaderValue,
  takesBasicAuth,
} from '@/models/backend';
import { useAppSelector } from '@/store';
import { putBackend } from '@/store/backends';
import SaveIcon from '@expo/material-symbols/save.xml';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Chip } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export function getBackendHeaderFormHref(backendId: BackendId, headerIndex: number): Href {
  return { pathname: '/backend-header', params: { backendId, headerIndex } };
}

export function BackendHeaderForm(props: { backendId: BackendId; headerIndex: number }) {
  const { dismiss } = useRouter();
  const backend = useAppSelector((s) => s.backends.backends.find((x) => x.id === props.backendId));

  const hasBackend = !!backend;
  useEffect(() => {
    if (!hasBackend) {
      dismiss();
    }
  }, [hasBackend, dismiss]);

  return backend ? <HeaderForm backend={backend} headerIndex={props.headerIndex} /> : null;
}

function HeaderForm({ backend, headerIndex }: { backend: Backend; headerIndex: number }) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { dismiss } = useRouter();
  const initial: BackendHeader = backend.headers[headerIndex] ?? { name: '', value: '' };
  const isNew = headerIndex >= backend.headers.length;
  const initialCredentials = takesBasicAuth(initial.name) ? parseBasicAuthHeaderValue(initial.value) : undefined;

  const [name, setName] = useState(initial.name);
  const [value, setValue] = useState(initialCredentials ? '' : initial.value);
  const [scheme, setScheme] = useState<'basic' | 'raw'>(initialCredentials ? 'basic' : 'raw');
  const [username, setUsername] = useState(initialCredentials?.username ?? '');
  const [password, setPassword] = useState(initialCredentials?.password ?? '');
  const [revealed, setRevealed] = useState(false);

  const isBasic = takesBasicAuth(name) && scheme === 'basic';
  const canSave = !!name.trim() && (isBasic ? !!username.trim() : !!value.trim());
  const save = () => {
    const headers = [...backend.headers];
    headers[headerIndex] = {
      name: name.trim(),
      value: isBasic ? basicAuthHeaderValue(username.trim(), password) : value.trim(),
    };
    dispatch(putBackend({ ...backend, headers }));
    dismiss();
  };

  const revealButton = (
    <IconButton
      icon={revealed ? 'visibilityOff' : 'visibility'}
      accessibilityLabel={t(revealed ? 'generic.hide.button' : 'generic.show.button')}
      onPress={() => setRevealed(!revealed)}
    />
  );

  return (
    <FullHeightScrollView
      modal
      avoidKeyboard
      floatingChildren={
        <PageActions
          primaryKind="commit"
          primary={{
            label: t('generic.save.button'),
            icon: SaveIcon,
            systemImage: 'square.and.arrow.down',
            disabled: !canSave,
            onPress: save,
          }}
        />
      }
    >
      <Stack.Screen options={{ title: isNew ? t('backends.headers.add.title') : t('backends.headers.edit.title') }} />
      <Form>
        <View style={{ gap: spacing[2] }}>
          <SegmentedGroup>
            <SegmentedListTextInput
              label={t('backends.header_name.label')}
              value={name}
              onChangeText={setName}
              autoFocus={isNew}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </SegmentedGroup>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {commonHeaderNames.map((suggestion) => (
              <Chip
                key={suggestion}
                compact
                showSelectedCheck={false}
                selected={name.trim().toLowerCase() === suggestion.toLowerCase()}
                onPress={() => setName(suggestion)}
              >
                {suggestion}
              </Chip>
            ))}
          </View>
        </View>
        {takesBasicAuth(name) && (
          <SegmentedPicker
            value={scheme}
            onChange={setScheme}
            options={[
              { value: 'basic', label: t('backends.header_scheme.basic') },
              { value: 'raw', label: t('backends.header_scheme.raw') },
            ]}
          />
        )}
        <SegmentedGroup>
          {isBasic ? (
            [
              <SegmentedListTextInput
                key="username"
                label={t('backends.basic_auth.username.label')}
                value={username}
                onChangeText={setUsername}
                autoCorrect={false}
                autoCapitalize="none"
                textContentType="username"
              />,
              <SegmentedListTextInput
                key="password"
                label={t('backends.basic_auth.password.label')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!revealed}
                autoCorrect={false}
                autoCapitalize="none"
                textContentType="password"
                trailing={revealButton}
              />,
            ]
          ) : (
            <SegmentedListTextInput
              label={t('backends.header_value.label')}
              value={value}
              onChangeText={setValue}
              secureTextEntry={isSecretHeader(name) && !revealed}
              autoCorrect={false}
              autoCapitalize="none"
              trailing={isSecretHeader(name) ? revealButton : undefined}
            />
          )}
        </SegmentedGroup>
      </Form>
    </FullHeightScrollView>
  );
}
