import React from 'react';
import { StyleProp, TextProps, TextStyle } from 'react-native';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import LimitedHtml from '@/components/presentation/limited-html';
import { useTranslate } from '@tolgee/react';
import { Rest } from '@/models/session-models';
import { Duration } from '@js-joda/core';

interface RestFormatProps {
  rest: Rest;
  highlight?: boolean;
}

export default function RestFormat({
  rest,
  highlight = true,
  ...restProps
}: RestFormatProps & TextProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();

  const formatTimeSpan = (duration: Duration): string => {
    const totalSeconds = duration.seconds();
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Determine highlight styles based on the highlight prop
  const emStyles: StyleProp<TextStyle> = {
    fontWeight: 'bold',
    ...(highlight ? { color: colors.primary } : {}),
  };

  return (
    <>
      {rest.minRest.compareTo(rest.maxRest) >= 0 ? (
        <LimitedHtml
          value={t('RestSingular{Time}', {
            0: formatTimeSpan(rest.minRest),
          })}
          emStyles={emStyles}
          {...restProps}
        />
      ) : (
        <LimitedHtml
          value={t('RestBetween{Time1}{Time2}', {
            0: formatTimeSpan(rest.minRest),
            1: formatTimeSpan(rest.maxRest),
          })}
          emStyles={emStyles}
          {...restProps}
        />
      )}
    </>
  );
}
