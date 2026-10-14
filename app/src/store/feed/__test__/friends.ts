import { Friend } from '@/models/feed-models';

export function makeFriend(id: string, overrides: Partial<Friend> = {}): Friend {
  return new Friend(
    id,
    { spkiPublicKeyBytes: new Uint8Array([1]) },
    `name-${id}`,
    undefined,
    'friend',
    [{ value: new Uint8Array([2]), algorithm: 'AES-CBC' }],
    undefined,
    `their-secret-${id}`,
    `my-secret-${id}`,
  ).with(overrides);
}
