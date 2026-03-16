import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';
import { useServices } from './services-provider';
import { useAppSelector } from '@/store';
import { Platform } from 'react-native';
import { List } from 'react-native-paper';
import { setExportToHealthAggregator } from '@/store/settings';
import ListSwitch from '../presentation/foundation/list-switch';

export function HealthExportSwitch() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { healthExportService } = useServices();
  const canExport = healthExportService.canExport();
  const exportToHealthAggregator = useAppSelector(
    (x) => x.settings.exportToHealthAggregator,
  );
  if (!canExport) {
    return undefined;
  }
  return Platform.select({
    android: (
      <ListSwitch
        headline={t('export.health_connect.title')}
        supportingText={t('export.health_connect.subtitle')}
        left={(props) => <List.Icon icon={'heartCheck'} {...props} />}
        onValueChange={(val) => {
          dispatch(setExportToHealthAggregator(val));
        }}
        value={exportToHealthAggregator}
      />
    ),
  });
}
