export type Role = 'owner' | 'admin' | 'member';

export type Pool = {
  id: string;
  name: string;
  championshipName: string;
  ownerUid: string;
  inviteCode: string;
};

export type PoolMember = {
  uid: string;
  role: Role;
  displayName: string;
  email?: string;
  inviteCode?: string;
};

export type PoolInvite = {
  code: string;
  poolId: string;
  poolName: string;
  championshipName: string;
};

export type Match = {
  id: string;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  stadium: string;
  group: string;
  city: string;
  officialHomeScore?: number;
  officialAwayScore?: number;
};

export type Prediction = {
  id: string;
  uid: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
};
