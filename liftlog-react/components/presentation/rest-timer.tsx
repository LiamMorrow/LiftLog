import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import RestFormat from '@/components/presentation/rest-format';
import LimitedHtml from '@/components/presentation/limited-html';
import { useTranslate } from '@tolgee/react'; // Using Tolgee for localization
import { Rest } from '@/models/session-models';
import { Snackbar } from 'react-native-paper';
import { Duration, LocalDateTime } from '@js-joda/core';

interface RestTimerProps {
  rest: Rest;
  startTime: LocalDateTime;
  failed: boolean;
}

export default function RestTimer({ rest, startTime, failed }: RestTimerProps) {
  const { colors } = useAppTheme();
  const getTimeSinceStart = () => {
    const diffMs = Duration.between(startTime, LocalDateTime.now());
    return formatTimeSpan(diffMs);
  };
  // Function to format time in m:ss format
  const formatTimeSpan = (ms: Duration): string => {
    const totalSeconds = Math.floor(ms.toMillis() / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const [timeSinceStart, setTimeSinceStart] =
    useState<string>(getTimeSinceStart());
  const { t } = useTranslate(); // Initialize Tolgee translations

  // Timer effect to update time every 200ms
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSinceStart(getTimeSinceStart());
    }, 200);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <Snackbar
      wrapperStyle={{ position: 'relative', paddingBottom: 0 }}
      visible={true}
      onDismiss={() => {}}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {failed ? (
          <LimitedHtml
            style={{ color: colors.inverseOnSurface }}
            value={t('RestSingular', {
              0: formatTimeSpan(rest.failureRest),
            })}
            emStyles={{ fontWeight: 'bold' }}
          />
        ) : (
          <RestFormat
            style={{ color: colors.inverseOnSurface }}
            highlight={false}
            rest={rest}
          />
        )}
        <Text style={{ fontWeight: 'bold', color: colors.inverseOnSurface }}>
          {timeSinceStart}
        </Text>
      </View>
    </Snackbar>
  );
}
