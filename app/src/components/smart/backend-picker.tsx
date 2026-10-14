import SelectPicker from '@/components/presentation/foundation/select-picker';
import { BackendFeature, BackendId, canBeSetToNoBackend } from '@/models/backend';
import { useAppSelectorWithArg } from '@/store';
import {
  clearBackendAssignment,
  selectAllowedBackendsForFeature,
  selectAssignedBackendId,
  setBackendAssignment,
} from '@/store/backends';
import { useTranslate } from '@tolgee/react';
import { useDispatch } from 'react-redux';

const unassigned = '';

export function BackendPicker(props: {
  feature: BackendFeature;
  /** Lets a caller confirm before the switch lands - the feed loses its account when it moves. */
  onChange?: (backendId: BackendId | undefined) => void;
}) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const backends = useAppSelectorWithArg(selectAllowedBackendsForFeature, props.feature);
  const assigned = useAppSelectorWithArg(selectAssignedBackendId, props.feature);

  const options = backends.map((backend) => ({ value: backend.id, label: backend.name }));
  if (canBeSetToNoBackend(props.feature)) {
    options.unshift({ value: unassigned, label: t('backends.none.label') });
  }

  const change = (value: string) => {
    const backendId = value === unassigned ? undefined : value;
    if (props.onChange) {
      props.onChange(backendId);
      return;
    }
    dispatch(
      backendId ? setBackendAssignment({ feature: props.feature, backendId }) : clearBackendAssignment(props.feature),
    );
  };

  return <SelectPicker value={assigned ?? unassigned} options={options} onChange={change} />;
}
