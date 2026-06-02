import { MatchPerformance, CareerStats } from './types';

export function calculateCareerStats(matches: MatchPerformance[]): CareerStats {
  const matchesCount = matches.length;
  let totalRuns = 0;
  let totalBalls = 0;
  let highestScore = 0;
  let outs = 0;
  let fifties = 0;
  let hundreds = 0;

  let totalWickets = 0;
  let totalOvers = 0;
  let totalRunsConceded = 0;
  let bestBowling: { wickets: number; runs: number } | null = null;

  let catchesCount = 0;
  let stumpingsCount = 0;

  matches.forEach(m => {
    // Batting stats
    const runs = m.runsScored !== undefined ? m.runsScored : 0;
    const balls = m.ballsFaced !== undefined ? m.ballsFaced : 0;
    
    if (m.runsScored !== undefined) {
      totalRuns += runs;
      if (runs > highestScore) highestScore = runs;
      if (runs >= 50 && runs < 100) fifties++;
      if (runs >= 100) hundreds++;
    }
    if (m.ballsFaced !== undefined) {
      totalBalls += balls;
    }
    if (m.isOut) {
      outs++;
    }

    // Bowling stats
    const wickets = m.wicketsTaken !== undefined ? m.wicketsTaken : 0;
    const overs = m.oversBowled !== undefined ? m.oversBowled : 0;
    const runsConceded = m.runsConceded !== undefined ? m.runsConceded : 0;

    if (m.wicketsTaken !== undefined || m.oversBowled !== undefined || m.runsConceded !== undefined) {
      totalWickets += wickets;
      totalOvers += overs;
      totalRunsConceded += runsConceded;

      if (m.wicketsTaken !== undefined && m.runsConceded !== undefined) {
        if (!bestBowling || 
            wickets > bestBowling.wickets || 
            (wickets === bestBowling.wickets && runsConceded < bestBowling.runs)) {
          bestBowling = { wickets, runs: runsConceded };
        }
      }
    }

    // Fielding stats
    catchesCount += m.catches || 0;
    stumpingsCount += m.stumpings || 0;
  });

  const notOuts = matchesCount - outs;

  const battingAverage = outs > 0 ? parseFloat((totalRuns / outs).toFixed(2)) : totalRuns;
  const battingStrikeRate = totalBalls > 0 ? parseFloat(((totalRuns / totalBalls) * 100).toFixed(2)) : 0;

  // Convert fractional overs (e.g. 3.2 -> 3 overs and 2 balls) to total balls
  const convertOversToBalls = (o: number): number => {
    const completed = Math.floor(o);
    const fraction = Math.round((o - completed) * 10);
    return completed * 6 + fraction;
  };
  
  const totalBallsBowled = convertOversToBalls(totalOvers);
  const trueOvers = totalBallsBowled / 6;

  const bowlingAverage = totalWickets > 0 ? parseFloat((totalRunsConceded / totalWickets).toFixed(2)) : 0;
  const bowlingStrikeRate = totalWickets > 0 ? parseFloat((totalBallsBowled / totalWickets).toFixed(2)) : 0;
  const economy = trueOvers > 0 ? parseFloat((totalRunsConceded / trueOvers).toFixed(2)) : 0;

  return {
    matchesCount,
    totalRuns,
    totalBalls,
    battingAverage,
    battingStrikeRate,
    highestScore,
    notOuts,
    fifties,
    hundreds,
    totalWickets,
    totalOvers: parseFloat(totalOvers.toFixed(1)),
    totalRunsConceded,
    bowlingAverage,
    bowlingStrikeRate,
    economy,
    bestBowling,
    catchesCount,
    stumpingsCount
  };
}

export function formatBestBowling(bestBowling: { wickets: number; runs: number } | null): string {
  if (!bestBowling) return 'N/A';
  return `${bestBowling.wickets}/${bestBowling.runs}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getSeasonFromDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 4) return '';
  const year = parseInt(dateStr.slice(0, 4), 10);
  if (isNaN(year)) return '';
  const nextYearShort = (year + 1).toString().slice(-2);
  return `${year}-${nextYearShort}`;
}

export function isMatchInSeason(matchDate: string, selectedSeason: string): boolean {
  if (selectedSeason === 'All') return true;
  const matchSeason = getSeasonFromDate(matchDate);
  return matchSeason === selectedSeason || matchDate.startsWith(selectedSeason);
}
