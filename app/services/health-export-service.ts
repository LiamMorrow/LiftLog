import { HealthExportService as HES } from './health-export-service-shared';
export class HealthExportService implements HES {
  canExport() {
    return false;
  }
  async exportWorkout() {}
  async requestPermission() {}
  async deleteWorkout() {}
}
