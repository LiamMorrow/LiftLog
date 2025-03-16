import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import LimitedHtml from '@/components/presentation/limited-html';
import { useTranslate } from '@tolgee/react';
import { Rest } from '@/models/blueprint-models';
import { Duration } from '@js-joda/core';

interface RestFormatProps {
  rest: Rest;
  highlight?: boolean;
}

export default function RestFormat({
  rest,
  highlight = true,
}: RestFormatProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();

  // Function to format Duration in m:ss format
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
        />
      ) : (
        <LimitedHtml
          value={t('RestBetween{Time1}{Time2}', {
            0: formatTimeSpan(rest.minRest),
            1: formatTimeSpan(rest.maxRest),
          })}
          emStyles={emStyles}
        />
      )}
    </>
  );
}
