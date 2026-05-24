/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MatchPerformance, CareerStats } from './types';

/**
 * Convert overs representation (e.g., 3.4 representing 3 overs and 4 balls)
 * to total balls bowled.
 */
export function oversToBalls(overs: number): number {
  const completedOvers = Math.floor(overs);
  const remainingBalls = Math.round((overs - completedOvers) * 10);
  // Cap remaining balls at 5, just in case (though should be 0-5)
  const actualRemaining = Math.min(remainingBalls, 5);
  return completedOvers * 6 + actualRemaining;
}

/**
 * Convert total balls to overs representation for display (e.g., 22 balls -> 3.4 overs)
 */
export function ballsToOvers(balls: number): number {
  const completedOvers = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return completedOvers + remainingBalls / 10;
}

export function calculateCareerStats(matches: MatchPerformance[]): CareerStats {
  const battingMatches = matches.filter(m => !m.didNotBat);
  const bowlingMatches = matches.filter(m => !m.didNotBowl);

  // Batting
  const totalRuns = battingMatches.reduce((sum, m) => sum + m.runsScored, 0);
  const totalBalls = battingMatches.reduce((sum, m) => sum + m.ballsFaced, 0);
  const inningsBatted = battingMatches.length;
  const notOuts = battingMatches.filter(m => !m.isOut).length;
  const outs = inningsBatted - notOuts;
  
  const battingAverage = outs > 0 ? Number((totalRuns / outs).toFixed(2)) : (inningsBatted > 0 ? totalRuns : 0);
  const battingStrikeRate = totalBalls > 0 ? Number(((totalRuns / totalBalls) * 100).toFixed(2)) : 0;
  const highestScore = battingMatches.length > 0 ? Math.max(...battingMatches.map(m => m.runsScored)) : 0;
  
  const fifties = battingMatches.filter(m => m.runsScored >= 50 && m.runsScored < 100).length;
  const hundreds = battingMatches.filter(m => m.runsScored >= 100).length;

  // Bowling
  const totalBallsBowled = bowlingMatches.reduce((sum, m) => sum + oversToBalls(m.oversBowled), 0);
  const totalOvers = Number((totalBallsBowled / 6).toFixed(1)); // Expressed in fractional overs count
  const totalRunsConceded = bowlingMatches.reduce((sum, m) => sum + m.runsConceded, 0);
  const totalWickets = bowlingMatches.reduce((sum, m) => sum + m.wicketsTaken, 0);
  const inningsBowled = bowlingMatches.length;

  const bowlingAverage = totalWickets > 0 ? Number((totalRunsConceded / totalWickets).toFixed(2)) : 0;
  const bowlingEconomy = totalBallsBowled > 0 ? Number(((totalRunsConceded / totalBallsBowled) * 6).toFixed(2)) : 0;
  const bowlingStrikeRate = totalWickets > 0 ? Number((totalBallsBowled / totalWickets).toFixed(2)) : 0;

  // Best Bowling Calculation
  let bestBowling: { wickets: number; runs: number } | null = null;
  for (const m of bowlingMatches) {
    if (!bestBowling) {
      bestBowling = { wickets: m.wicketsTaken, runs: m.runsConceded };
    } else {
      if (m.wicketsTaken > bestBowling.wickets) {
        bestBowling = { wickets: m.wicketsTaken, runs: m.runsConceded };
      } else if (m.wicketsTaken === bestBowling.wickets && m.runsConceded < bestBowling.runs) {
        bestBowling = { wickets: m.wicketsTaken, runs: m.runsConceded };
      }
    }
  }

  return {
    totalMatches: matches.length,
    totalRuns,
    totalBalls,
    inningsBatted,
    notOuts,
    battingAverage,
    battingStrikeRate,
    highestScore,
    fifties,
    hundreds,
    inningsBowled,
    totalOvers,
    totalRunsConceded,
    totalWickets,
    bowlingAverage,
    bowlingEconomy,
    bowlingStrikeRate,
    bestBowling,
  };
}

/**
 * Format best bowling (e.g., 5/24)
 */
export function formatBestBowling(best: { wickets: number; runs: number } | null): string {
  if (!best) return 'N/A';
  return `${best.wickets}/${best.runs}`;
}

/**
 * Format display for date (e.g. "May 24, 2026")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Get season representation from a date string (e.g. "2026-04-10" -> "2026-27")
 */
export function getSeasonFromDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 4) return '';
  const year = parseInt(dateStr.slice(0, 4), 10);
  if (isNaN(year)) return '';
  const nextYearShort = (year + 1).toString().slice(-2);
  return `${year}-${nextYearShort}`;
}

/**
 * Check if a match date falls under the selected season string
 */
export function isMatchInSeason(matchDate: string, selectedSeason: string): boolean {
  if (selectedSeason === 'All') return true;
  const matchSeason = getSeasonFromDate(matchDate);
  return matchSeason === selectedSeason || matchDate.startsWith(selectedSeason);
}

