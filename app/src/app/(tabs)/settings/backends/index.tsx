import { SettingsPage } from '@/components/layout/settings-page';
import {
  Backend,
  backendFeatureNameKey,
  backendFeatures,
  backendSupportsFeature,
  builtInBackendId,
  isBackendComplete,
} from '@/models/backend';
import { useAppSelector } from '@/store';
import { T, useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { BackendPicker } from '@/components/smart/backend-picker';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import { putBackend, selectAllBackends, switchFeedBackend } from '@/store/backends';
import { useAppTheme } from '@/hooks/useAppTheme';
import { uuid } from '@/utils/uuid';
import { useState } from 'react';
import { Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import AddIcon from '@expo/material-symbols/add.xml';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { SegmentedListLink } from '@/components/presentation/foundation/segmented-list-link';
import { PageActions } from '@/components/presentation/foundation/page-actions';

export default function BackendsPage() {
  const { t } = useTranslate();
  const { push } = useRouter();
  const dispatch = useDispatch();
  const backends = useAppSelector(selectAllBackends);
  const { colors } = useAppTheme();
  const [pendingFeedBackend, setPendingFeedBackend] = useState<string | undefined>(undefined);

  // The editor edits a backend rather than filling in a form, so one exists before it opens. An
  // editor left with nothing typed into it removes what it was given.
  const addBackend = () => {
    const id = uuid();
    dispatch(putBackend({ id, name: '', url: '', kind: 'liftlog', headers: [] }));
    push(`/settings/backends/${id}`);
  };

  const describe = (backend: Backend) =>
    t('backends.supports.subtitle', {
      features: backendFeatures
        .filter((feature) => backendSupportsFeature(backend, feature))
        .map((feature) => t(backendFeatureNameKey[feature]))
        .join(', '),
    });

  return (
    <SettingsPage
      title={t('backends.title')}
      caption={t('backends.explanation')}
      docs="SelfHosting.md"
      actions={
        <PageActions
          primary={{
            label: t('backends.add.button'),
            onPress: addBackend,
            icon: AddIcon,
            systemImage: 'plus',
          }}
        />
      }
    >
      <SegmentedGroup>
        <SegmentListFormElement
          label={t('backends.feed.label')}
          icon={'forum'}
          right={<BackendPicker feature="feed" onChange={setPendingFeedBackend} />}
        />
        <SegmentListFormElement
          label={t('backends.ai_planner.label')}
          icon={'boltFill'}
          right={<BackendPicker feature="aiPlanner" />}
        />
        <SegmentListFormElement
          label={t('backends.backup.label')}
          icon={'cloudUploadFill'}
          right={<BackendPicker feature="backup" />}
        />
      </SegmentedGroup>

      <SegmentedGroup>
        {backends.map((backend) =>
          backend.id === builtInBackendId ? (
            <SegmentListFormElement
              key={backend.id}
              label={backend.name}
              supportingText={describe(backend)}
              icon={'publicFill'}
            />
          ) : (
            <SegmentedListLink
              key={backend.id}
              label={backend.name || t('backends.unnamed.label')}
              supportingText={
                isBackendComplete(backend) ? (
                  describe(backend)
                ) : (
                  <Text style={{ color: colors.error }}>{t('backends.incomplete.label')}</Text>
                )
              }
              icon={isBackendComplete(backend) ? 'dnsFill' : 'error'}
              onPress={() => push(`/settings/backends/${backend.id}`)}
            />
          ),
        )}
      </SegmentedGroup>

      <ConfirmationDialog
        open={pendingFeedBackend !== undefined}
        headline={t('backends.feed_switch.title')}
        textContent={<T keyName="backends.feed_switch.body" />}
        onCancel={() => setPendingFeedBackend(undefined)}
        onOk={() => {
          if (pendingFeedBackend) {
            dispatch(switchFeedBackend({ backendId: pendingFeedBackend }));
          }
          setPendingFeedBackend(undefined);
        }}
      />
    </SettingsPage>
  );
}
