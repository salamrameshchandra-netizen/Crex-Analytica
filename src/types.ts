/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper-Batsman';

export interface MatchPerformance {
  id: string;
  opponent: string;
  format: 'T20' | 'ODI' | 'Test';
  date: string;
  // Batting stats
  battingNotes?: string;
  runsScored: number; // -1 if didn't bat? Let's just use 0 and didNotBat boolean or just default to 0 and check if didNotBat is checked.
  didNotBat: boolean;
  ballsFaced: number;
  isOut: boolean;
  // Bowling stats
  didNotBowl: boolean;
  oversBowled: number; // e.g. 4, 10
  runsConceded: number;
  wicketsTaken: number;
  maidens?: number;
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  state: string;
  bio?: string;
  imageUrl?: string;
  matches: MatchPerformance[];
}

export interface CareerStats {
  totalMatches: number;
  // Batting career
  totalRuns: number;
  totalBalls: number;
  inningsBatted: number;
  notOuts: number;
  battingAverage: number;
  battingStrikeRate: number;
  highestScore: number;
  fifties: number;
  hundreds: number;
  // Bowling career
  inningsBowled: number;
  totalOvers: number;
  totalRunsConceded: number;
  totalWickets: number;
  bowlingAverage: number;
  bowlingEconomy: number;
  bowlingStrikeRate: number;
  bestBowling: { wickets: number; runs: number } | null;
}
