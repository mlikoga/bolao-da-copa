export type Role = 'owner' | 'admin' | 'member';

export type Pool = {
  id: string;
  name: string;
  season: string;
  ownerUid: string;
  inviteCode: string;
};

export type Match = {
  id: string;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  lockedAt: string;
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
