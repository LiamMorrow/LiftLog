import { ResolvedBackendForFeature } from '@/models/backend';
import { HubConnectionBuilder, IRetryPolicy } from '@microsoft/signalr';

export class HubConnectionFactory {
  create(backend: ResolvedBackendForFeature, path: string, options?: { reconnectPolicy?: IRetryPolicy }) {
    const builder = new HubConnectionBuilder().withUrl(`${backend.url}${path}`, { headers: backend.headers });
    return (options?.reconnectPolicy ? builder.withAutomaticReconnect(options.reconnectPolicy) : builder).build();
  }
}
