import { SurfaceText } from '@/components/presentation/surface-text';
import { SessionBlueprint } from '@/models/blueprint-models';

interface ManageWorkoutCardContentProps {
  session: SessionBlueprint;
}
export default function ManageWorkoutCardContent({
  session,
}: ManageWorkoutCardContentProps) {
  return <SurfaceText>{session.name}</SurfaceText>;
}
