import { SettingsPage } from '@/components/layout/settings-page';
import { BackendHeaderEditor } from '@/components/presentation/backends/backend-header-editor';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import { FormRow } from '@/components/presentation/foundation/form-row';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import { SegmentedGroup } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListSelect } from '@/components/presentation/foundation/segmented-list-select';
import {
  Backend,
  backendFeatureNameKey,
  backendUrlIsValid,
  BackendKind,
  normalizeBackendUrl,
  ReportedBackendFeature,
} from '@/models/backend';
import {
  BackendProbeFailure,
  BackendProbeResult,
  probeBackendFeatures,
  probeBackupEndpoint,
} from '@/services/backend-probe';
import { useAppSelector } from '@/store';
import { putBackend, removeBackend } from '@/store/backends';
import { T, TranslationKey, useTranslate } from '@tolgee/react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import ExperimentIcon from '@expo/material-symbols/experiment.xml';
import DeleteIcon from '@expo/material-symbols/delete.xml';
import { HelperText, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';

const kindOptions = [
  { value: 'liftlog', label: 'backends.kind.liftlog.label', body: 'backends.kind.liftlog.body' },
  {
    value: 'backupEndpoint',
    label: 'backends.kind.backup_endpoint.label',
    body: 'backends.kind.backup_endpoint.body',
  },
] as const satisfies { value: BackendKind; label: TranslationKey; body: TranslationKey }[];

type ProbeState = { status: 'idle' } | { status: 'checking' } | { status: 'done'; message: string; ok: boolean };

/** HTTP/2 has no reason phrase, so the code stands alone rather than trailing a space. */
const statusLabel = (statusCode: number, statusText: string) => [statusCode, statusText].filter(Boolean).join(' ');

/** What a test result is a result for: the same values tested again would answer the same. */
const probeSignatureOf = (backend: Backend) => JSON.stringify([backend.url, backend.kind, backend.headers]);

export default function BackendEditorPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backend = useAppSelector((s) => s.backends.backends.find((x) => x.id === id));
  if (!backend) {
    return <Redirect href={'/settings/backends'} />;
  }
  return <BackendEditor backend={backend} />;
}

function BackendEditor({ backend }: { backend: Backend }) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const router = useRouter();
  const [probe, setProbe] = useState<ProbeState>({ status: 'idle' });
  const probeSignature = probeSignatureOf(backend);
  const [previousProbeSignature, setPreviousProbeSignature] = useState(probeSignatureOf(backend));
  const [deleteOpen, setDeleteOpen] = useState(false);

  const update = (changes: Partial<Backend>) => dispatch(putBackend({ ...backend, ...changes }));

  const nameError = backend.name.trim() ? '' : t('backends.name.required.message');
  const urlError = !backend.url.trim()
    ? t('backends.url.required.message')
    : backendUrlIsValid(backend.url)
      ? ''
      : t('backends.url.error.message');
  const canTest = backendUrlIsValid(backend.url);
  if (previousProbeSignature !== probeSignature) {
    setPreviousProbeSignature(probeSignature);
    setProbe((current) => (current.status === 'idle' ? current : { status: 'idle' }));
  }

  // Adding a backend creates it, so one that was opened and never filled in was never really added.
  const latest = useRef(backend);
  useEffect(() => {
    latest.current = backend;
  }, [backend]);
  useEffect(
    () => () => {
      const abandoned = latest.current;
      if (!abandoned.name.trim() && !abandoned.url.trim()) {
        dispatch(removeBackend(abandoned.id));
      }
    },
    [dispatch],
  );

  // A server is free to report a feature this version has never heard of, and its own id is the
  // most useful thing we can show for it.
  const featureName = (feature: string) =>
    feature in backendFeatureNameKey ? t(backendFeatureNameKey[feature as ReportedBackendFeature]) : feature;

  // A failed test is only useful if it says what the server did, so every line we have is shown.
  const lines = (...parts: (string | undefined)[]) => parts.filter(Boolean).join('\n');

  const describeFailure = (failure: BackendProbeFailure) => {
    switch (failure.kind) {
      case 'httpError':
        return t('backends.test.http_error', { status: statusLabel(failure.statusCode, failure.statusText) });
      case 'notJson':
        return failure.contentType
          ? t('backends.test.not_json_content_type', { contentType: failure.contentType })
          : t('backends.test.not_json');
      case 'notFeatureObject':
        return t('backends.test.not_feature_object');
    }
  };

  const describeUnreachable = (error: string) =>
    error ? t('backends.test.unreachable_detail', { error }) : t('backends.test.unreachable');

  const describeBody = (body: string) => (body ? t('backends.test.response_body', { body }) : undefined);

  const describeProbe = (result: BackendProbeResult) => {
    switch (result.status) {
      case 'ok':
        return t('backends.test.offers', { features: result.features.map(featureName).join(', ') });
      case 'notLiftLog':
        return lines(
          describeFailure(result.failure),
          describeBody(result.failure.body),
          t('backends.test.not_liftlog'),
        );
      case 'unreachable':
        return describeUnreachable(result.error);
    }
  };

  const test = async () => {
    setProbe({ status: 'checking' });
    // A backup endpoint has no /features to ask, so it is checked the only way the protocol allows.
    if (backend.kind === 'backupEndpoint') {
      const result = await probeBackupEndpoint(backend);
      setProbe({
        status: 'done',
        ok: result.status === 'ok',
        message:
          result.status === 'ok'
            ? t('backends.test.backup_ok')
            : result.status === 'refused'
              ? lines(
                  t('backends.test.backup_refused', {
                    status: statusLabel(result.statusCode, result.statusText),
                  }),
                  describeBody(result.body),
                )
              : describeUnreachable(result.error),
      });
      return;
    }
    const result = await probeBackendFeatures(backend);
    setProbe({ status: 'done', message: describeProbe(result), ok: result.status === 'ok' });
  };

  return (
    <SettingsPage
      title={backend.name || t('backends.add.button')}
      actions={
        <PageActions
          primary={{
            disabled: !canTest || probe.status === 'checking',
            label: t('generic.test.button'),
            onPress: () => void test(),
            icon: ExperimentIcon,
            systemImage: 'flask',
          }}
          secondary={[
            {
              label: t('generic.delete.button'),
              onPress: () => setDeleteOpen(true),
              icon: DeleteIcon,
              systemImage: 'trash',
            },
          ]}
        />
      }
    >
      <FormRow noGap>
        <TextInput
          mode="outlined"
          label={t('backends.name.label')}
          value={backend.name}
          error={!!nameError}
          onChangeText={(name) => update({ name })}
          onBlur={() => update({ name: backend.name.trim() })}
          autoCorrect={false}
        />
        <HelperText type="error">{nameError}</HelperText>
        <TextInput
          mode="outlined"
          label={t('backends.url.label')}
          placeholder="https://liftlog.example.com"
          value={backend.url}
          error={!!urlError}
          onChangeText={(url) => update({ url })}
          onBlur={() => update({ url: normalizeBackendUrl(backend.url) })}
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="url"
        />
        <HelperText type="error">{urlError}</HelperText>
      </FormRow>

      <SegmentedGroup>
        <SegmentedListSelect
          label={t('backends.kind.label')}
          icon={'settingsFill'}
          value={backend.kind}
          options={kindOptions.map(({ value, label }) => ({ value, label: t(label) }))}
          onChange={(kind) => update({ kind })}
          supportingText={t(kindOptions.find((option) => option.value === backend.kind)!.body)}
        />
      </SegmentedGroup>

      <BackendHeaderEditor headers={backend.headers} onChange={(headers) => update({ headers })} />

      {probe.status === 'idle' ? null : (
        <HelperText type={probe.status === 'done' && !probe.ok ? 'error' : 'info'}>
          {probe.status === 'checking' ? t('backends.test.checking') : probe.message}
        </HelperText>
      )}

      <ConfirmationDialog
        open={deleteOpen}
        headline={t('backends.delete.title')}
        textContent={<T keyName="backends.delete.message" />}
        onCancel={() => setDeleteOpen(false)}
        onOk={() => {
          dispatch(removeBackend(backend.id));
          router.back();
        }}
      />
    </SettingsPage>
  );
}
