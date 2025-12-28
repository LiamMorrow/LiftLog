import ItemTitle from '@/components/presentation/item-title';
import { SurfaceText } from '@/components/presentation/surface-text';
import { Session } from '@/models/session-models';
import { LocalDate } from '@js-joda/core';
import { View } from 'react-native';
import { useFormatDate } from '@/hooks/useFormatDate';

interface SessionSummaryTitleProps {
  session: Session;
  isFilled?: boolean;
}
export default function SessionSummaryTitle({
  session,
  isFilled,
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
      <ItemTitle title={session.blueprint.name} />
      {isFilled ? (
        <SurfaceText font="text-sm">{formattedDate}</SurfaceText>
      ) : undefined}
    </View>
  );
}
