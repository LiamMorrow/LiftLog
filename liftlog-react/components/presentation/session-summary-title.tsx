import ItemTitle from '@/components/presentation/item-title';
import { SurfaceText } from '@/components/presentation/surface-text';
import { Session } from '@/models/session-models';
import { DateTimeFormatter, LocalDate } from '@js-joda/core';
import { View } from 'react-native';

interface SessionSummaryTitleProps {
  session: Session;
  isFilled: boolean;
}
export default function SessionSummaryTitle({
  session,
  isFilled,
}: SessionSummaryTitleProps) {
  const formattedDate =
    session.date.year() === LocalDate.now().year()
      ? session.date.format(DateTimeFormatter.ofPattern('d d M'))
      : `${session.date.format(DateTimeFormatter.ofPattern('d d M'))} ${session.date.year()}`;
  return (
    <View
      style={{ flexShrink: 1, alignItems: 'flex-start', overflow: 'hidden' }}
      data-cy="session-summary-title"
    >
      <ItemTitle title={session.blueprint.name} />
      {isFilled ? (
        <SurfaceText font="text-sm">{formattedDate}</SurfaceText>
      ) : undefined}
    </View>
  );
}
