import { Session } from '@/models/session-models';

export interface HealthExportService {
  canExport(): boolean;
  exportWorkout(workout: Session): Promise<void>;
  requestPermission(): Promise<void>;
  deleteWorkout(workoutId: string): Promise<void>;
}
