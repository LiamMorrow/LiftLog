import ItemTitle from '@/components/presentation/foundation/item-title';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { Session } from '@/models/session-models';
import { LocalDate } from '@js-joda/core';
import { View } from 'react-native';
import { useFormatDate } from '@/hooks/useFormatDate';
import { ColorChoice } from '@/hooks/useAppTheme';

interface SessionSummaryTitleProps {
  session: Session;
  isFilled?: boolean;
  color?: ColorChoice;
}
export default function SessionSummaryTitle({
  session,
  isFilled,
  color = 'onSurface',
}: SessionSummaryTitleProps) {
  const formatDate = useFormatDate();
  const formattedDate = formatDate(session.date, {
    year:
      session.date.year() !== LocalDate.now().year() ? 'numeric' : undefined,
    day: 'numeric',
    weekday: 'long',
    month: 'long',
  });
  return (
    <View
      style={{ flexShrink: 1, alignItems: 'flex-start', overflow: 'hidden' }}
      testID="session-summary-title"
    >
      <ItemTitle title={session.blueprint.name} color={color} />
      {isFilled ? (
        <SurfaceText font="text-sm" color={color}>
          {formattedDate}
        </SurfaceText>
      ) : undefined}
    </View>
  );
}
