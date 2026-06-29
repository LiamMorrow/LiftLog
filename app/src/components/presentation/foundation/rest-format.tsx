import React from 'react';
import { TextProps } from 'react-native';
import { Rest } from '@/models/blueprint-models';
import { Duration } from '@js-joda/core';
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

export const formatTimeSpan = (duration: Duration): string => {
  const totalSeconds = duration.seconds();
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
