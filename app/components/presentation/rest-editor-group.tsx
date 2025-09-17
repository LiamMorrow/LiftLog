import DurationEditor from '@/components/presentation/duration-editor';
import RestFormat from '@/components/presentation/rest-format';
import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { Rest } from '@/models/blueprint-models';
import { Duration } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { match } from 'ts-pattern';
import LabelledFormRow from '@/components/presentation/labelled-form-row';

type ButtonValues = keyof typeof Rest | 'custom';

interface RestEditorGroupProps {
  rest: Rest;
  onRestUpdated: (rest: Rest) => void;
}
export default function RestEditorGroup(props: RestEditorGroupProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const { onRestUpdated, rest } = props;
  const [buttonValue, setButtonValue] = useState(
    match(rest)
      .returnType<ButtonValues>()
      .with(Rest.short, () => 'short')
      .with(Rest.medium, () => 'medium')
      .with(Rest.long, () => 'long')
      .otherwise(() => 'custom'),
  );
  const handleValueChange = (val: ButtonValues) => {
    setButtonValue(val);
    if (val === 'custom') {
    } else {
      onRestUpdated(Rest[val]);
    }
  };

  const updateRest = (type: keyof Rest) => (duration: Duration) =>
    onRestUpdated({ ...rest, [type]: duration });

  const customView =
    buttonValue === 'custom' ? (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[2],
        }}
      >
        <DurationEditor
          label={t('MinRest')}
          duration={rest.minRest}
          onDurationUpdated={updateRest('minRest')}
        />
        <DurationEditor
          label={t('MaxRest')}
          duration={rest.maxRest}
          onDurationUpdated={updateRest('maxRest')}
        />
        <DurationEditor
          label={t('FailureRest')}
          duration={rest.failureRest}
          onDurationUpdated={updateRest('failureRest')}
        />
      </View>
    ) : (
      <View style={{ marginTop: spacing[4] }}>
        <RestFormat style={{ color: colors.onSurface }} rest={rest} />
      </View>
    );
  return (
    <LabelledFormRow label={t('Rest')} icon="airlineSeatReclineExtraFill">
      <View style={{ width: '100%' }}>
        <SegmentedButtons
          style={{ width: '100%' }}
          value={buttonValue}
          onValueChange={(s) => handleValueChange(s as ButtonValues)}
          buttons={[
            {
              value: 'short',
              label: t('RestShort'),
            },
            {
              value: 'medium',
              label: t('RestMedium'),
            },
            {
              value: 'long',
              label: t('RestLong'),
            },
            {
              value: 'custom',
              label: t('Custom'),
            },
          ]}
        />
      </View>
      {customView}
    </LabelledFormRow>
  );
}
