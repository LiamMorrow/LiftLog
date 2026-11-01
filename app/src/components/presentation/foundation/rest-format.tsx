import React from 'react';
import { TextProps } from 'react-native';
import { Rest } from '@/models/blueprint-models';
import { formatTimeSpan } from '@/utils/format-time-span';
import { AppText } from '@/components/presentation/foundation/app-text';

interface RestFormatProps {
  rest: Rest;
}

export default function RestFormat({ rest }: RestFormatProps & TextProps) {
  return (
    <AppText>
      {rest.minRest.compareTo(rest.maxRest) >= 0
        ? formatTimeSpan(rest.minRest)
        : `${formatTimeSpan(rest.minRest)} - ${formatTimeSpan(rest.maxRest)}`}

      {rest.failureRest.compareTo(rest.maxRest) >= 0 && `, ${formatTimeSpan(rest.failureRest)}`}
    </AppText>
  );
}

export { formatTimeSpan };
