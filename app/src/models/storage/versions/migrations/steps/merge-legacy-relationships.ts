import { AesKeyJSON, RsaPublicKeyJSON } from '@/models/storage/versions/libs';
import { FriendJSON } from '@/models/storage/versions/initial';

export interface LegacyFollowedUser {
  id: string;
  publicKey: RsaPublicKeyJSON;
  name: string | undefined;
  aesKey?: AesKeyJSON;
  followSecret?: string;
}

export interface LegacyPendingUser {
  id: string;
  publicKey: RsaPublicKeyJSON;
  name: string | undefined;
}

export interface LegacyFollower {
  id: string;
  publicKey: RsaPublicKeyJSON;
  name: string | undefined;
  followSecret: string;
}

export interface LegacyRelationships {
  ownId: string | undefined;
  followed: LegacyFollowedUser[];
  pending: LegacyPendingUser[];
  followers: LegacyFollower[];
}

export interface MergedRelationships {
  friends: FriendJSON[];
  secretsToRevoke: string[];
}

export function mergeLegacyRelationships({
  ownId,
  followed,
  pending,
  followers,
}: LegacyRelationships): MergedRelationships {
  const accepted = new Map<string, LegacyFollowedUser & { aesKey: AesKeyJSON; followSecret: string }>();
  for (const user of followed) {
    if (user.aesKey && user.followSecret) {
      accepted.set(user.id, { ...user, aesKey: user.aesKey, followSecret: user.followSecret });
    }
  }
  const followerById = new Map(followers.map((x) => [x.id, x]));
  const pendingById = new Map([...followed, ...pending].map((x) => [x.id, x]));

  const friends: FriendJSON[] = [];
  const secretsToRevoke = new Set<string>();

  for (const id of new Set([...accepted.keys(), ...followerById.keys(), ...pendingById.keys()])) {
    const following = accepted.get(id);
    const follower = followerById.get(id);

    if (id === ownId) {
      for (const secret of [following?.followSecret, follower?.followSecret]) {
        if (secret) {
          secretsToRevoke.add(secret);
        }
      }
      continue;
    }

    const known = following ?? follower;
    if (!known) {
      continue;
    }

    friends.push({
      id,
      publicKey: known.publicKey,
      name: following?.name ?? follower?.name ?? pendingById.get(id)?.name,
      currentPlan: undefined,
      status: following && follower ? 'friend' : following ? 'legacyFollowing' : 'legacyFollower',
      theirKeys: following ? [following.aesKey] : [],
      theirKeysSentAt: undefined,
      theirSecret: following?.followSecret,
      mySecret: follower?.followSecret,
    });
  }

  return { friends, secretsToRevoke: [...secretsToRevoke] };
}
