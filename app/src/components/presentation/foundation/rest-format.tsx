import React from 'react';
import { TextProps } from 'react-native';
import { Rest } from '@/models/blueprint-models';
import { formatTimeSpan } from '@/utils/format-time-span';
import { Text } from 'react-native-paper';

interface RestFormatProps {
  rest: Rest;
}

export default function RestFormat({ rest }: RestFormatProps & TextProps) {
  return (
    <Text>
      {rest.minRest.compareTo(rest.maxRest) >= 0
        ? formatTimeSpan(rest.minRest)
        : `${formatTimeSpan(rest.minRest)} - ${formatTimeSpan(rest.maxRest)}`}

      {rest.failureRest.compareTo(rest.maxRest) >= 0 && `, ${formatTimeSpan(rest.failureRest)}`}
    </Text>
  );
}

export { formatTimeSpan };
