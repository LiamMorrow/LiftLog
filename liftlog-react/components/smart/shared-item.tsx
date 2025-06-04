import { SurfaceText } from '@/components/presentation/surface-text';
import { SharedItem } from '@/models/feed-models';

interface SharedItemProps {
  sharedItem: SharedItem;
}
export default function SharedItemComponent({ sharedItem }: SharedItemProps) {
  return (
    <>
      <SurfaceText>hi</SurfaceText>
    </>
  );
}
