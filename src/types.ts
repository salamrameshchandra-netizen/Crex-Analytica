export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper-Batsman';

export interface MatchPerformance {
  id: string;
  date: string; // 'YYYY-MM-DD'
  opponent: string;
  runsScored?: number;
  ballsFaced?: number;
  isOut?: boolean;
  wicketsTaken?: number;
  oversBowled?: number;
  runsConceded?: number;
  catches?: number;
  stumpings?: number;
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  state: string; // represent state
  bio?: string;
  imageUrl?: string;
  matches: MatchPerformance[];
}

export interface CareerStats {
  matchesCount: number;
  totalRuns: number;
  totalBalls: number;
  battingAverage: number;
  battingStrikeRate: number;
  highestScore: number;
  notOuts: number;
  fifties: number;
  hundreds: number;
  totalWickets: number;
  totalOvers: number;
  totalRunsConceded: number;
  bowlingAverage: number;
  bowlingStrikeRate: number;
  economy: number;
  bestBowling: { wickets: number; runs: number } | null;
  catchesCount: number;
  stumpingsCount: number;
}
