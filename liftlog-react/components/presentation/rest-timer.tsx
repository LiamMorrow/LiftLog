import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import RestFormat from '@/components/presentation/rest-format';
import LimitedHtml from '@/components/presentation/limited-html';
import { useTranslate } from '@tolgee/react'; // Using Tolgee for localization
import { Rest } from '@/models/blueprint-models';
import { Snackbar } from 'react-native-paper';
import { Duration } from '@js-joda/core';

// You'll need to adjust these imports based on your project structure

interface RestTimerProps {
  rest: Rest; // Replace with your actual Rest type
  startTime: Date;
  failed: boolean;
  visible: boolean;
}

export default function RestTimer({
  rest,
  startTime,
  failed,
  visible,
}: RestTimerProps) {
  const { colors } = useAppTheme();
  const [timeSinceStart, setTimeSinceStart] = useState<string>('0:00');
  const { t } = useTranslate(); // Initialize Tolgee translations

  // Function to format time in m:ss format
  const formatTimeSpan = (ms: Duration): string => {
    const totalSeconds = Math.floor(ms.toMillis() / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Timer effect to update time every 200ms
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      setTimeSinceStart(formatTimeSpan(Duration.ofMillis(diffMs)));
    }, 200);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <Snackbar visible={visible} onDismiss={() => {}}>
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
          <RestFormat highlight={false} rest={rest} />
        )}
        <Text style={{ fontWeight: 'bold', color: colors.inverseOnSurface }}>
          {timeSinceStart}
        </Text>
      </View>
    </Snackbar>
  );
}
