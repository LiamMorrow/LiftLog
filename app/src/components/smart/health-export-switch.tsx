import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';
import { useServices } from './services-provider';
import { useAppSelector } from '@/store';
import { Platform } from 'react-native';
import { setExportToHealthAggregator } from '@/store/settings';
import { SegmentedListSwitch } from '../presentation/foundation/segmented-list-switch';

/**
 * Lets a caller leave the switch out of a segmented group entirely: a child that renders nothing
 * still takes up a segment, so the group needs to know before it lays out.
 */
export function useCanExportHealth() {
  const { healthExportService } = useServices();
  return healthExportService.canExport() && (Platform.OS === 'android' || Platform.OS === 'ios');
}

export function HealthExportSwitch() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const canExport = useCanExportHealth();
  const exportToHealthAggregator = useAppSelector((x) => x.settings.exportToHealthAggregator);
  if (!canExport) {
    return undefined;
  }
  return (
    <SegmentedListSwitch
      label={Platform.OS === 'ios' ? t('export.healthkit.title') : t('export.health_connect.title')}
      supportingText={Platform.OS === 'ios' ? t('export.healthkit.subtitle') : t('export.health_connect.subtitle')}
      icon={'heartCheck'}
      value={exportToHealthAggregator}
      onValueChange={(val) => dispatch(setExportToHealthAggregator(val))}
    />
  );
}
