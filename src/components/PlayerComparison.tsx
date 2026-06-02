import { useState } from 'react';
import { Player } from '../types';
import { calculateCareerStats, formatBestBowling } from '../utils';

interface PlayerComparisonProps {
  players: Player[];
  onClose: () => void;
}

export default function PlayerComparison({ players, onClose }: PlayerComparisonProps) {
  const [playerAId, setPlayerAId] = useState(players[0]?.id || '');
  const [playerBId, setPlayerBId] = useState(players[1]?.id || players[0]?.id || '');

  const playerA = players.find(p => p.id === playerAId);
  const playerB = players.find(p => p.id === playerBId);

  const statsA = playerA ? calculateCareerStats(playerA.matches) : null;
  const statsB = playerB ? calculateCareerStats(playerB.matches) : null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
        >
          ✕
        </button>

        <h3 className="font-extrabold text-base text-white uppercase tracking-wider mb-6 font-mono text-center">Athlete Side-by-Side Comparison</h3>

        {/* Player Selectors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Player A Selector */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <span className="block text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1.5 font-mono">ATHLETE A</span>
            <select
              className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-755 border-slate-700 text-xs font-bold text-white px-3 py-2 rounded-xl focus:outline-none transition-colors"
              value={playerAId}
              onChange={(e) => setPlayerAId(e.target.value)}
            >
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>

          {/* Player B Selector */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <span className="block text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 font-mono">ATHLETE B</span>
            <select
              className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-755 border-slate-700 text-xs font-bold text-white px-3 py-2 rounded-xl focus:outline-none transition-colors"
              value={playerBId}
              onChange={(e) => setPlayerBId(e.target.value)}
            >
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Head-to-Head Cards */}
        {playerA && playerB && statsA && statsB ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <h4 className="font-black text-sm text-slate-100">{playerA.name}</h4>
                <p className="text-[10px] font-bold text-amber-500 uppercase font-mono">{playerA.role} • {playerA.state}</p>
              </div>
              <div className="border-l border-slate-800">
                <h4 className="font-black text-sm text-slate-100">{playerB.name}</h4>
                <p className="text-[10px] font-bold text-indigo-400 uppercase font-mono">{playerB.role} • {playerB.state}</p>
              </div>
            </div>

            {/* Metrics Breakdown Table */}
            <div className="bg-slate-950/30 rounded-2xl border border-slate-800/80 p-2 overflow-hidden">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 text-[9px] font-black text-slate-500 uppercase tracking-wider font-mono">
                    <th className="py-2.5 w-1/3">Athlete A</th>
                    <th className="py-2.5 w-1/3 text-slate-400">Metric</th>
                    <th className="py-2.5 w-1/3">Athlete B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {/* Matches Count */}
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">{statsA.matchesCount}</td>
                    <td className="py-3 text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold">Matches Played</td>
                    <td className="py-3 font-semibold text-slate-200">{statsB.matchesCount}</td>
                  </tr>

                  {/* Batting Section Headers */}
                  <tr className="bg-slate-900/50">
                    <td colSpan={3} className="py-2 text-[9px] font-bold uppercase tracking-widest text-emerald-400 font-mono text-center">Batting Metrics</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">{statsA.totalRuns}</td>
                    <td className="py-3 text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold">Total Runs</td>
                    <td className="py-3 font-semibold text-slate-200">{statsB.totalRuns}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">{statsA.battingAverage}</td>
                    <td className="py-3 text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold">Batting Avg</td>
                    <td className="py-3 font-semibold text-slate-200">{statsB.battingAverage}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">{statsA.battingStrikeRate}</td>
                    <td className="py-3 text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold">Strike Rate</td>
                    <td className="py-3 font-semibold text-slate-200">{statsB.battingStrikeRate}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">{statsA.highestScore}</td>
                    <td className="py-3 text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold">Highest Score</td>
                    <td className="py-3 font-semibold text-slate-200">{statsB.highestScore}</td>
                  </tr>

                  {/* Bowling Section Headers */}
                  <tr className="bg-slate-900/50">
                    <td colSpan={3} className="py-2 text-[9px] font-bold uppercase tracking-widest text-indigo-400 font-mono text-center">Bowling Metrics</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">{statsA.totalWickets}</td>
                    <td className="py-3 text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold">Wickets Taken</td>
                    <td className="py-3 font-semibold text-slate-200">{statsB.totalWickets}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">{statsA.economy}</td>
                    <td className="py-3 text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold">Economy</td>
                    <td className="py-3 font-semibold text-slate-200">{statsB.economy}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">{statsA.bowlingAverage || 'N/A'}</td>
                    <td className="py-3 text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold">Bowling Avg</td>
                    <td className="py-3 font-semibold text-slate-200">{statsB.bowlingAverage || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">{formatBestBowling(statsA.bestBowling)}</td>
                    <td className="py-3 text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold">Best Bowl</td>
                    <td className="py-3 font-semibold text-slate-200">{formatBestBowling(statsB.bestBowling)}</td>
                  </tr>

                  {/* Fielding Section */}
                  <tr className="bg-slate-900/50">
                    <td colSpan={3} className="py-2 text-[9px] font-bold uppercase tracking-widest text-amber-500 font-mono text-center">Fielding Metrics</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">{statsA.catchesCount}</td>
                    <td className="py-3 text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold">Catches</td>
                    <td className="py-3 font-semibold text-slate-200">{statsB.catchesCount}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">{statsA.stumpingsCount}</td>
                    <td className="py-3 text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold">Stumpings</td>
                    <td className="py-3 font-semibold text-slate-200">{statsB.stumpingsCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-xs text-slate-500">Add more players to start benchmarking side-by-side matches.</p>
        )}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-100 rounded-xl text-xs font-bold transition-all text-center border border-slate-700/60"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
