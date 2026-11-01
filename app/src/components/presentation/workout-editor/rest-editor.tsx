import { DurationInput } from '@/components/presentation/foundation/editors/number-inputs';
import { spacing } from '@/hooks/useAppTheme';
import { Rest } from '@/models/blueprint-models';
import { Duration } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { match } from 'ts-pattern';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import SegmentedPicker from '@/components/presentation/foundation/segmented-picker';
import { RestRangeSlider, useRestThumbStyles } from '@/components/presentation/workout-editor/rest-range-slider';

type ButtonValues = 'short' | 'medium' | 'long' | 'custom';

interface RestEditorProps {
  rest: Rest;
  onRestUpdated: (rest: Rest) => void;
}

export function RestEditor(props: RestEditorProps) {
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

  const updateCustomRest = (next: Rest) => {
    setButtonValue('custom');
    onRestUpdated(next);
  };
  const updateRest = (type: keyof Rest) => (duration: Duration) => updateCustomRest({ ...rest, [type]: duration });
  const thumbStyles = useRestThumbStyles();

  const durationRows = [
    { key: 'minRest', label: t('rest.min.label') },
    { key: 'maxRest', label: t('rest.max.label') },
    { key: 'failureRest', label: t('rest.failure.label') },
  ] as const;
  return (
    <View style={{ gap: spacing[4] }}>
      <SegmentedPicker
        value={buttonValue}
        onChange={handleValueChange}
        equalWidth={false}
        options={[
          { value: 'short', label: t('rest.short.label') },
          { value: 'medium', label: t('rest.medium.label') },
          { value: 'long', label: t('rest.long.label') },
          { value: 'custom', label: t('generic.custom.label') },
        ]}
      />
      <RestRangeSlider rest={rest} onChange={updateCustomRest} />
      <SegmentedGroup>
        {durationRows.map(({ key, label }) => (
          <SegmentListFormElement
            key={key}
            label={label}
            leading={
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: key === 'minRest' ? thumbStyles[key].border : thumbStyles[key].fill,
                  backgroundColor: thumbStyles[key].fill,
                }}
              />
            }
            right={<DurationInput duration={rest[key]} onDurationUpdated={updateRest(key)} />}
          />
        ))}
      </SegmentedGroup>
    </View>
  );
}
