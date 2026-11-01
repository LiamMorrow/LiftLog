import DnsIcon from '@expo/material-symbols/dns.xml';
import ErrorIcon from '@expo/material-symbols/error.xml';
import BoltIcon from '@expo/material-symbols/bolt.xml';
import CloudUploadIcon from '@expo/material-symbols/cloud_upload.xml';
import ForumIcon from '@expo/material-symbols/forum.xml';
import PublicIcon from '@expo/material-symbols/public.xml';
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
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { BackendPicker } from '@/components/smart/backend-picker';
import { useConfirm } from '@/hooks/useConfirm';
import { putBackend, selectAllBackends, switchFeedBackend } from '@/store/backends';
import { useAppTheme } from '@/hooks/useAppTheme';
import { uuid } from '@/utils/uuid';
import { AppText } from '@/components/presentation/foundation/app-text';
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
  const confirm = useConfirm();
  const confirmFeedSwitch = (backendId: string | undefined) => {
    if (!backendId) {
      return;
    }
    confirm({
      title: t('backends.feed_switch.title'),
      message: t('backends.feed_switch.body'),
      destructive: true,
      onOk: () => dispatch(switchFeedBackend({ backendId })),
    });
  };

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
          icon={ForumIcon}
          systemImage="bubble.left.and.bubble.right"
          right={<BackendPicker feature="feed" onChange={confirmFeedSwitch} />}
        />
        <SegmentListFormElement
          label={t('backends.ai_planner.label')}
          icon={BoltIcon}
          systemImage="bolt.fill"
          right={<BackendPicker feature="aiPlanner" />}
        />
        <SegmentListFormElement
          label={t('backends.backup.label')}
          icon={CloudUploadIcon}
          systemImage="icloud.and.arrow.up.fill"
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
              icon={PublicIcon}
              systemImage="globe.americas.fill"
            />
          ) : (
            <SegmentedListLink
              key={backend.id}
              label={backend.name || t('backends.unnamed.label')}
              supportingText={
                isBackendComplete(backend) ? (
                  describe(backend)
                ) : (
                  <AppText style={{ color: colors.error }}>{t('backends.incomplete.label')}</AppText>
                )
              }
              {...(isBackendComplete(backend)
                ? { icon: DnsIcon, systemImage: 'server.rack' as const }
                : { icon: ErrorIcon, systemImage: 'exclamationmark.circle' as const })}
              onPress={() => push(`/settings/backends/${backend.id}`)}
            />
          ),
        )}
      </SegmentedGroup>
    </SettingsPage>
  );
}
