import ItemTitle from '@/components/presentation/foundation/item-title';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { Session } from '@/models/session-models';
import { LocalDate } from '@js-joda/core';
import { View } from 'react-native';
import { useFormatDate } from '@/hooks/useFormatDate';
import { ColorChoice } from '@/hooks/useAppTheme';

interface SessionSummaryTitleProps {
  session: Session;
  showDate?: boolean;
  byline?: string;
  color?: ColorChoice;
}
export default function SessionSummaryTitle({
  session,
  showDate,
  byline,
  color = 'onSurface',
}: SessionSummaryTitleProps) {
  const formatDate = useFormatDate();
  const formattedDate = formatDate(session.date, {
    year: session.date.year() !== LocalDate.now().year() ? 'numeric' : undefined,
    day: 'numeric',
    weekday: 'long',
    month: 'long',
  });
  const subtitle = [byline, showDate ? formattedDate : undefined].filter((x) => !!x).join(' · ');
  return (
    <View style={{ flexShrink: 1, alignItems: 'flex-start', overflow: 'hidden' }} testID="session-summary-title">
      <ItemTitle title={session.blueprint.name} color={color} />
      {subtitle ? (
        <SurfaceText font="text-sm" color={color}>
          {subtitle}
        </SurfaceText>
      ) : undefined}
    </View>
  );
}
