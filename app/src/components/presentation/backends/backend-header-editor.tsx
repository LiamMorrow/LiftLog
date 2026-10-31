import IconButton from '@/components/presentation/foundation/icon-button';
import { SegmentedList, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { BackendHeader, isSecretHeader } from '@/models/backend';
import { useTranslate } from '@tolgee/react';
import { Text } from 'react-native-paper';

// A fixed length, so the list does not report how long a secret is.
const maskedValue = '•'.repeat(12);

export function BackendHeaderEditor(props: {
  headers: BackendHeader[];
  onChange: (headers: BackendHeader[]) => void;
  /** An index past the last header adds one. */
  onEdit: (index: number) => void;
}) {
  const { headers, onChange } = props;
  const { t } = useTranslate();
  const { colors } = useAppTheme();

  const bodyStyle = { color: colors.onSurfaceVariant, marginBlockStart: spacing[2] };

  return (
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
            onPress={() => props.onEdit(index)}
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
          onPress={() => props.onEdit(headers.length)}
        />,
      ]}
    />
  );
}
