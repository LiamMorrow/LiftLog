import { ResolvedBackendForFeature } from '@/models/backend';
import { HubConnectionBuilder } from '@microsoft/signalr';

export class HubConnectionFactory {
  create(backend: ResolvedBackendForFeature, path: string) {
    const builder = new HubConnectionBuilder();
    return builder.withUrl(`${backend.url}${path}`, { headers: backend.headers }).build();
  }
}
