import Button from '@/components/presentation/foundation/button';
import IconButton from '@/components/presentation/foundation/icon-button';
import { SegmentedList, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { basicAuthHeaderValue, BackendHeader, parseBasicAuthHeaderValue } from '@/models/backend';
import { T, useTranslate } from '@tolgee/react';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import { useState } from 'react';
import { View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Chip, Dialog, Portal, Text, TextInput } from 'react-native-paper';

const commonHeaderNames = ['Authorization', 'Proxy-Authorization', 'X-API-Key'];

const secretHeaderNames = ['authorization', 'proxy-authorization', 'x-api-key'];

// Both carry the same `<scheme> <credentials>` value, so both can be filled in as a username and password.
const basicAuthHeaderNames = ['authorization', 'proxy-authorization'];

const takesBasicAuth = (name: string) => basicAuthHeaderNames.includes(name.trim().toLowerCase());

const isSecretHeader = (name: string) => secretHeaderNames.includes(name.trim().toLowerCase());

// A fixed length, so the list does not report how long a secret is.
const maskedValue = '\u2022'.repeat(12);

interface EditingHeader {
  index: number;
  header: BackendHeader;
}

export function BackendHeaderEditor(props: { headers: BackendHeader[]; onChange: (headers: BackendHeader[]) => void }) {
  const { headers, onChange } = props;
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const [editing, setEditing] = useState<EditingHeader | undefined>(undefined);

  const bodyStyle = { color: colors.onSurfaceVariant, marginBlockStart: spacing[2] };

  return (
    <>
      <SegmentedList
        items={[
          <SegmentListFormElement
            key="title"
            label={t('backends.headers.label')}
            icon={'vpnKeyFill'}
            supportingText={t('backends.headers.explanation')}
          />,
          ...headers.map((header, index) => (
            <SegmentListFormElement
              key={`header-${index}`}
              label={header.name}
              icon={'vpnKey'}
              onPress={() => setEditing({ index, header })}
              right={
                <IconButton
                  icon="close"
                  accessibilityLabel={t('generic.delete.button')}
                  onPress={() => onChange(headers.filter((_, i) => i !== index))}
                />
              }
              line2={
                <Text variant="bodySmall" numberOfLines={1} style={bodyStyle}>
                  {isSecretHeader(header.name) ? maskedValue : header.value}
                </Text>
              }
            />
          )),
          <SegmentListFormElement
            key="add"
            label={t('backends.headers.add.button')}
            icon={'add'}
            onPress={() => setEditing({ index: headers.length, header: { name: '', value: '' } })}
          />,
        ]}
      />
      {editing && (
        <HeaderDialog
          key={editing.index}
          initial={editing.header}
          isNew={editing.index === headers.length}
          onCancel={() => setEditing(undefined)}
          onConfirm={(header) => {
            const next = [...headers];
            next[editing.index] = header;
            onChange(next);
            setEditing(undefined);
          }}
        />
      )}
    </>
  );
}

function HeaderDialog(props: {
  initial: BackendHeader;
  isNew: boolean;
  onCancel: () => void;
  onConfirm: (header: BackendHeader) => void;
}) {
  const { t } = useTranslate();
  const initialCredentials = takesBasicAuth(props.initial.name)
    ? parseBasicAuthHeaderValue(props.initial.value)
    : undefined;
  const [name, setName] = useState(props.initial.name);
  const [value, setValue] = useState(initialCredentials ? '' : props.initial.value);
  const [scheme, setScheme] = useState<'basic' | 'raw'>(initialCredentials ? 'basic' : 'raw');
  const [username, setUsername] = useState(initialCredentials?.username ?? '');
  const [password, setPassword] = useState(initialCredentials?.password ?? '');
  const [revealed, setRevealed] = useState(false);

  const isBasic = takesBasicAuth(name) && scheme === 'basic';
  const canConfirm = !!name.trim() && (isBasic ? !!username.trim() : !!value.trim());
  const confirm = () =>
    props.onConfirm({
      name: name.trim(),
      value: isBasic ? basicAuthHeaderValue(username.trim(), password) : value.trim(),
    });

  const revealIcon = (
    <TextInput.Icon
      icon={revealed ? 'visibilityOff' : 'visibility'}
      accessibilityLabel={t(revealed ? 'generic.hide.button' : 'generic.show.button')}
      onPress={() => setRevealed(!revealed)}
    />
  );

  return (
    <Portal>
      <KeyboardAvoidingView behavior="height" style={{ flex: 1, pointerEvents: 'box-none' }}>
        <Dialog visible onDismiss={props.onCancel}>
          <Dialog.Title>
            {props.isNew ? t('backends.headers.add.title') : t('backends.headers.edit.title')}
          </Dialog.Title>
          <Dialog.Content style={{ gap: spacing[2] }}>
            <TextInput
              mode="outlined"
              label={t('backends.header_name.label')}
              value={name}
              onChangeText={setName}
              autoFocus={props.isNew}
              autoCorrect={false}
              autoCapitalize="none"
            />
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
            {takesBasicAuth(name) && (
              <View style={{ width: '100%' }}>
                <SegmentedPicker
                  value={scheme}
                  onChange={setScheme}
                  options={[
                    { value: 'basic', label: t('backends.header_scheme.basic') },
                    { value: 'raw', label: t('backends.header_scheme.raw') },
                  ]}
                />
              </View>
            )}
            {isBasic ? (
              <>
                <TextInput
                  mode="outlined"
                  label={t('backends.basic_auth.username.label')}
                  value={username}
                  onChangeText={setUsername}
                  autoCorrect={false}
                  autoCapitalize="none"
                  textContentType="username"
                />
                <TextInput
                  mode="outlined"
                  label={t('backends.basic_auth.password.label')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!revealed}
                  autoCorrect={false}
                  autoCapitalize="none"
                  textContentType="password"
                  right={revealIcon}
                />
              </>
            ) : (
              <TextInput
                mode="outlined"
                label={t('backends.header_value.label')}
                value={value}
                onChangeText={setValue}
                secureTextEntry={isSecretHeader(name) && !revealed}
                autoCorrect={false}
                autoCapitalize="none"
                right={isSecretHeader(name) ? revealIcon : undefined}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={props.onCancel}>
              <T keyName="generic.cancel.button" />
            </Button>
            <Button disabled={!canConfirm} onPress={confirm}>
              <T keyName="generic.save.button" />
            </Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}
