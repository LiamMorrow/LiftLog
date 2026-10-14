import { formatSessionVolume } from '@/components/presentation/summary/format-exercise-summary';
import ItemTitle from '@/components/presentation/foundation/item-title';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { Session } from '@/models/session-models';
import { LocalDate } from '@js-joda/core';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { useFormatDate } from '@/hooks/useFormatDate';
import { ColorChoice, spacing } from '@/hooks/useAppTheme';

interface SessionSummaryTitleProps {
  session: Session;
  showDate?: boolean;
  showVolume?: boolean;
  byline?: string;
  /** Sits against the byline, where the person is named -- not against the title, which needs the full width. */
  bylineLeading?: ReactNode;
  color?: ColorChoice;
}
export default function SessionSummaryTitle({
  session,
  showDate,
  showVolume,
  byline,
  bylineLeading,
  color = 'onSurface',
}: SessionSummaryTitleProps) {
  const formatDate = useFormatDate();
  const formattedDate = formatDate(session.date, {
    year: session.date.year() !== LocalDate.now().year() ? 'numeric' : undefined,
    day: 'numeric',
    weekday: 'long',
    month: 'long',
  });
  const subtitle = [byline, showDate ? formattedDate : undefined, showVolume ? formatSessionVolume(session) : undefined]
    .filter((x) => !!x)
    .join(' · ');
  return (
    <View style={{ flexShrink: 1, alignItems: 'flex-start', overflow: 'hidden' }} testID="session-summary-title">
      <ItemTitle title={session.blueprint.name} color={color} />
      {subtitle ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingTop: spacing[0.5] }}>
          {bylineLeading}
          <SurfaceText font="text-sm" color={color} style={{ flexShrink: 1 }}>
            {subtitle}
          </SurfaceText>
        </View>
      ) : undefined}
    </View>
  );
}
