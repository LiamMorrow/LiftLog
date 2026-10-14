import { CardioTarget, matchCardioTarget } from '@/models/blueprint-models';
import { formatDistance } from '@/utils/distance';
import { formatTimeSpan } from '@/utils/format-time-span';

export function formatCardioTarget(target: CardioTarget): string {
  return matchCardioTarget(target, {
    distance: (t) => formatDistance(t.value),
    time: (t) => formatTimeSpan(t.value),
  });
}
