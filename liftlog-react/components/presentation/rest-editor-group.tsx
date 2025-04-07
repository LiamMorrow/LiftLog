import LimitedHtml from '@/components/presentation/limited-html';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Rest } from '@/models/blueprint-models';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { match } from 'ts-pattern';

type ButtonValues = keyof typeof Rest | 'custom';

interface RestEditorGroupProps {
  rest: Rest;
  onRestUpdated: (rest: Rest) => void;
}
export default function RestEditorGroup(props: RestEditorGroupProps) {
  const { spacing, colors, font } = useAppTheme();
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
  return (
    <View style={{ gap: spacing[5] }}>
      <LimitedHtml
        style={{
          ...font['text-lg'],
          color: colors.onSurface,
          marginLeft: spacing[4],
        }}
        value={t('RestSingular', { 0: '' })}
      />
      <View style={{ width: '100%' }}>
        <SegmentedButtons
          style={{ width: '100%' }}
          value={buttonValue}
          onValueChange={(s) => setButtonValue(s as ButtonValues)}
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
        ></SegmentedButtons>
      </View>
    </View>
  );
}
