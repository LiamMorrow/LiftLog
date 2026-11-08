import { AppText } from '@/components/foundation/app-text';
import { NativeButton } from '@/components/foundation/native-button';
import { copyLogs } from '@/store/app';
import { openUrl } from '@/utils/open-url';
import BugReportIcon from '@expo/material-symbols/bug_report.xml';
import TerminalIcon from '@expo/material-symbols/terminal.xml';
import { useTranslate } from '@tolgee/react';
import * as Application from 'expo-application';
import { useState } from 'react';
import { Platform } from 'react-native';
import { useDispatch } from 'react-redux';

export function ReportProblemActions() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);

  const appVersion = Application.nativeApplicationVersion ?? Application.nativeBuildVersion ?? 'Unknown';
  const bugReportUrl = `https://github.com/LiamMorrow/LiftLog/issues/new?assignees=&labels=bug&projects=&template=bug_report.yaml&app-version=${encodeURIComponent(appVersion)}&platform=${Platform.OS}&os-version=${Platform.Version}`;

  const doCopyLogs = () => {
    dispatch(copyLogs());
    setCopied(true);
  };

  return (
    <>
      <NativeButton
        variant="text"
        icon={BugReportIcon}
        systemImage="ladybug"
        label={t('app.stuck_loading.report.button')}
        onPress={() => openUrl(bugReportUrl)}
      />
      <NativeButton
        variant="text"
        icon={TerminalIcon}
        systemImage="apple.terminal"
        label={t('app.stuck_loading.copy_logs.button')}
        onPress={doCopyLogs}
      />
      {copied && (
        <AppText variant="bodyMedium" color="onSurfaceVariant" style={{ textAlign: 'center' }}>
          {t('app.stuck_loading.copied.label')}
        </AppText>
      )}
    </>
  );
}
