import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@/models/session-models';

const healthConnect = vi.hoisted(() => ({
  initialize: vi.fn(),
  requestPermission: vi.fn(),
  getGrantedPermissions: vi.fn(),
  insertRecords: vi.fn(),
  deleteRecordsByUuids: vi.fn(),
}));

vi.mock('react-native', () => ({ Platform: { OS: 'android', Version: 35 } }));
vi.mock('react-native-health-connect', () => ({
  ...healthConnect,
  ExerciseSegmentType: { WEIGHTLIFTING: 79, OTHER_WORKOUT: 0 },
  ExerciseType: { WEIGHTLIFTING: 79 },
}));

import { HealthExportService } from './health-export-service.android';

function startedWorkout(): Session {
  return {
    id: 'workout-id',
    isStarted: true,
    firstExercise: { earliestTime: '2026-07-31T10:00:00Z' },
    lastExercise: { latestTime: '2026-07-31T11:00:00Z' },
    recordedExercises: [],
    blueprint: { name: 'Test workout' },
  } as unknown as Session;
}

describe('Android HealthExportService permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    healthConnect.initialize.mockResolvedValue(true);
    healthConnect.requestPermission.mockResolvedValue([]);
    healthConnect.getGrantedPermissions.mockResolvedValue([]);
    healthConnect.insertRecords.mockResolvedValue([]);
    healthConnect.deleteRecordsByUuids.mockResolvedValue(undefined);
  });

  it('uses a non-interactive permission check when exporting', async () => {
    healthConnect.getGrantedPermissions.mockResolvedValue([{ accessType: 'write', recordType: 'ExerciseSession' }]);

    await new HealthExportService().exportWorkout(startedWorkout());

    expect(healthConnect.getGrantedPermissions).toHaveBeenCalledOnce();
    expect(healthConnect.requestPermission).not.toHaveBeenCalled();
    expect(healthConnect.insertRecords).toHaveBeenCalledOnce();
  });

  it('requests permissions only when explicitly asked', async () => {
    await new HealthExportService().requestPermission();

    expect(healthConnect.requestPermission).toHaveBeenCalledWith([
      { accessType: 'write', recordType: 'Weight' },
      { accessType: 'write', recordType: 'ExerciseSession' },
    ]);
    expect(healthConnect.getGrantedPermissions).not.toHaveBeenCalled();
  });

  it('deletes only record types with write access', async () => {
    healthConnect.getGrantedPermissions.mockResolvedValue([
      { accessType: 'read', recordType: 'Weight' },
      { accessType: 'write', recordType: 'ExerciseSession' },
    ]);

    await new HealthExportService().deleteWorkout('workout-id');

    expect(healthConnect.deleteRecordsByUuids).toHaveBeenCalledOnce();
    expect(healthConnect.deleteRecordsByUuids).toHaveBeenCalledWith('ExerciseSession', [], ['workout-id']);
  });
});
