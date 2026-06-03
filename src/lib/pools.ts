import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  writeBatch,
  type Unsubscribe
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './firebase';
import type { Pool, PoolInvite, PoolMember } from './types';

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEFAULT_CHAMPIONSHIP_NAME = 'Copa do Mundo 2026';

export type CreatePoolInput = {
  name: string;
  championshipName?: string;
};

export type JoinPoolResult = {
  poolId: string;
  alreadyMember: boolean;
};

function buildInviteCode() {
  const randomValues = new Uint32Array(6);
  crypto.getRandomValues(randomValues);

  return Array.from(randomValues, (value) => INVITE_CODE_ALPHABET[value % INVITE_CODE_ALPHABET.length]).join('');
}

export function normalizeInviteCode(inviteCode: string) {
  return inviteCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function getDisplayName(user: User) {
  return user.displayName ?? user.email?.split('@')[0] ?? 'Participante';
}

function getMemberData(user: User, role: PoolMember['role'], inviteCode: string) {
  return {
    uid: user.uid,
    role,
    displayName: getDisplayName(user),
    email: user.email ?? '',
    inviteCode,
    joinedAt: serverTimestamp()
  };
}

function getUserPoolData(poolId: string, role: PoolMember['role']) {
  return {
    poolId,
    role,
    joinedAt: serverTimestamp()
  };
}

function toPool(id: string, data: Record<string, unknown>): Pool {
  return {
    id,
    name: String(data.name ?? ''),
    championshipName: String(data.championshipName ?? DEFAULT_CHAMPIONSHIP_NAME),
    ownerUid: String(data.ownerUid ?? ''),
    inviteCode: String(data.inviteCode ?? '')
  };
}

function toMember(id: string, data: Record<string, unknown>): PoolMember {
  return {
    uid: String(data.uid ?? id),
    role: data.role === 'owner' || data.role === 'admin' ? data.role : 'member',
    displayName: String(data.displayName ?? 'Participante'),
    email: typeof data.email === 'string' ? data.email : undefined,
    inviteCode: typeof data.inviteCode === 'string' ? data.inviteCode : undefined
  };
}

function toInvite(id: string, data: Record<string, unknown>): PoolInvite {
  return {
    code: String(data.code ?? id),
    poolId: String(data.poolId ?? ''),
    poolName: String(data.poolName ?? ''),
    championshipName: String(data.championshipName ?? DEFAULT_CHAMPIONSHIP_NAME)
  };
}

export async function createPool(user: User, { name, championshipName = DEFAULT_CHAMPIONSHIP_NAME }: CreatePoolInput) {
  const trimmedName = name.trim();

  if (trimmedName.length < 3) {
    throw new Error('Informe um nome com pelo menos 3 caracteres.');
  }

  const poolRef = doc(collection(db, 'pools'));
  const inviteCode = buildInviteCode();
  const inviteRef = doc(db, 'poolInvites', inviteCode);
  const ownerMemberRef = doc(db, 'pools', poolRef.id, 'members', user.uid);
  const userPoolRef = doc(db, 'users', user.uid, 'pools', poolRef.id);
  const batch = writeBatch(db);
  const now = serverTimestamp();

  batch.set(poolRef, {
    name: trimmedName,
    championshipName: championshipName.trim() || DEFAULT_CHAMPIONSHIP_NAME,
    ownerUid: user.uid,
    inviteCode,
    createdAt: now,
    updatedAt: now
  });
  batch.set(ownerMemberRef, getMemberData(user, 'owner', inviteCode));
  batch.set(userPoolRef, getUserPoolData(poolRef.id, 'owner'));
  batch.set(inviteRef, {
    code: inviteCode,
    poolId: poolRef.id,
    poolName: trimmedName,
    championshipName: championshipName.trim() || DEFAULT_CHAMPIONSHIP_NAME,
    createdBy: user.uid,
    createdAt: now
  });

  await batch.commit();

  return poolRef.id;
}

export async function joinPoolByInviteCode(user: User, rawInviteCode: string): Promise<JoinPoolResult> {
  const inviteCode = normalizeInviteCode(rawInviteCode);

  if (inviteCode.length !== 6) {
    throw new Error('Informe um código de convite com 6 caracteres.');
  }

  const inviteRef = doc(db, 'poolInvites', inviteCode);

  return runTransaction(db, async (transaction) => {
    const inviteSnapshot = await transaction.get(inviteRef);

    if (!inviteSnapshot.exists()) {
      throw new Error('Código de convite não encontrado.');
    }

    const invite = toInvite(inviteSnapshot.id, inviteSnapshot.data());
    const memberRef = doc(db, 'pools', invite.poolId, 'members', user.uid);
    const userPoolRef = doc(db, 'users', user.uid, 'pools', invite.poolId);
    const memberSnapshot = await transaction.get(memberRef);

    if (memberSnapshot.exists()) {
      return { poolId: invite.poolId, alreadyMember: true };
    }

    transaction.set(memberRef, getMemberData(user, 'member', inviteCode));
    transaction.set(userPoolRef, getUserPoolData(invite.poolId, 'member'));

    return { poolId: invite.poolId, alreadyMember: false };
  });
}

export function subscribeToUserPools(user: User, onChange: (pools: Pool[]) => void, onError: (error: Error) => void): Unsubscribe {
  const userPoolsRef = collection(db, 'users', user.uid, 'pools');
  let disposed = false;

  const unsubscribe = onSnapshot(
    userPoolsRef,
    async (snapshot) => {
      try {
        const pools = await Promise.all(
          snapshot.docs.map(async (membershipDoc) => {
            const poolId = String(membershipDoc.data().poolId ?? membershipDoc.id);
            const poolSnapshot = await getDoc(doc(db, 'pools', poolId));
            return poolSnapshot.exists() ? toPool(poolSnapshot.id, poolSnapshot.data()) : null;
          })
        );

        if (!disposed) {
          onChange(pools.filter((pool): pool is Pool => pool !== null).sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (error) {
        if (!disposed) {
          onError(error instanceof Error ? error : new Error('Não foi possível carregar seus bolões.'));
        }
      }
    },
    (error) => onError(error)
  );

  return () => {
    disposed = true;
    unsubscribe();
  };
}

export async function listPoolMembers(poolId: string) {
  const membersSnapshot = await getDocs(collection(db, 'pools', poolId, 'members'));

  return membersSnapshot.docs
    .map((memberDoc) => toMember(memberDoc.id, memberDoc.data()))
    .sort((a, b) => {
      const roleOrder = { owner: 0, admin: 1, member: 2 } satisfies Record<PoolMember['role'], number>;
      return roleOrder[a.role] - roleOrder[b.role] || a.displayName.localeCompare(b.displayName);
    });
}
