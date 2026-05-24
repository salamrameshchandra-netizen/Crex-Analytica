/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Player } from '../types';
import { calculateCareerStats, formatBestBowling } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Check } from 'lucide-react';

interface PlayerComparisonProps {
  players: Player[];
}

export default function PlayerComparison({ players }: PlayerComparisonProps) {
  const [playerAId, setPlayerAId] = useState<string>(players[0]?.id || '');
  const [playerBId, setPlayerBId] = useState<string>(players[1]?.id || players[0]?.id || '');

  const playerA = players.find(p => p.id === playerAId);
  const playerB = players.find(p => p.id === playerBId);

  if (!playerA || !playerB) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center text-neutral-500">
        <Users className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
        <p className="text-sm">Please register at least 2 players to enable side-by-side comparison analytics.</p>
      </div>
    );
  }

  const statsA = calculateCareerStats(playerA.matches);
  const statsB = calculateCareerStats(playerB.matches);

  // Normalization scores (0-100%) for attribute bars to look like a gaming card!
  const getNormalizedValue = (val: number, max: number) => {
    if (max === 0) return 0;
    return Math.min(100, Math.round((val / max) * 100));
  };

  // Compare stats data structure
  const compareAttributes = [
    { label: 'Total Matches Played', valA: statsA.totalMatches, valB: statsB.totalMatches, max: Math.max(statsA.totalMatches, statsB.totalMatches, 10), format: (v: number) => v },
    { label: 'Career Total Runs', valA: statsA.totalRuns, valB: statsB.totalRuns, max: Math.max(statsA.totalRuns, statsB.totalRuns, 500), format: (v: number) => v },
    { label: 'Batting Average', valA: statsA.battingAverage, valB: statsB.battingAverage, max: Math.max(statsA.battingAverage, statsB.battingAverage, 60), format: (v: number) => v.toFixed(1) },
    { label: 'Batting Strike Rate', valA: statsA.battingStrikeRate, valB: statsB.battingStrikeRate, max: Math.max(statsA.battingStrikeRate, statsB.battingStrikeRate, 180), format: (v: number) => `${v.toFixed(1)}%` },
    { label: 'Total Wickets Taken', valA: statsA.totalWickets, valB: statsB.totalWickets, max: Math.max(statsA.totalWickets, statsB.totalWickets, 15), format: (v: number) => v },
    { label: 'Bowling Economy (Lower is better)', valA: statsA.bowlingEconomy, valB: statsB.bowlingEconomy, max: 12, format: (v: number) => v.toFixed(2), reverse: true },
  ];

  // Prepare chart data
  const chartData = [
    { name: 'Matches', [playerA.name]: statsA.totalMatches, [playerB.name]: statsB.totalMatches },
    { name: 'Bat. Avg', [playerA.name]: statsA.battingAverage, [playerB.name]: statsB.battingAverage },
    { name: 'Strike Rate / 2', [playerA.name]: Math.round(statsA.battingStrikeRate / 2), [playerB.name]: Math.round(statsB.battingStrikeRate / 2) },
    { name: 'Wickets * 10', [playerA.name]: statsA.totalWickets * 10, [playerB.name]: statsB.totalWickets * 10 },
    { name: 'Eco (Lower Better)', [playerA.name]: statsA.bowlingEconomy > 0 ? Number((15 - statsA.bowlingEconomy).toFixed(1)) : 0, [playerB.name]: statsB.bowlingEconomy > 0 ? Number((15 - statsB.bowlingEconomy).toFixed(1)) : 0 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xl">
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 text-white flex items-center justify-between border-b border-slate-850">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-450" />
          <h3 className="font-black text-sm uppercase tracking-wider font-sans text-white">Player VS Player Head-To-Head Analysis</h3>
        </div>
        <p className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider">Interactive dual comparative metric meters</p>
      </div>

      <div className="p-6">
        {/* Selector Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 animate-in fade-in">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Player A (Left Canvas)</label>
            <select
              className="w-full px-3 py-2 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={playerAId}
              onChange={(e) => setPlayerAId(e.target.value)}
            >
              {players.map(p => (
                <option key={p.id} value={p.id} disabled={p.id === playerBId}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Player B (Right Canvas)</label>
            <select
              className="w-full px-3 py-2 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={playerBId}
              onChange={(e) => setPlayerBId(e.target.value)}
            >
              {players.map(p => (
                <option key={p.id} value={p.id} disabled={p.id === playerAId}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Player info heads */}
        <div className="grid grid-cols-2 gap-4 py-6 text-center border-b border-slate-100 bg-slate-50/50">
          <div className="p-2">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-full mb-1 tracking-wider border border-emerald-150">
              TEAM A
            </span>
            <h4 className="font-black text-slate-900 text-base tracking-tight">{playerA.name}</h4>
            <p className="text-[11px] font-bold text-amber-600 uppercase font-mono">{playerA.role} • {playerA.state}</p>
          </div>
          <div className="p-2 border-l border-slate-150">
            <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-full mb-1 tracking-wider border border-indigo-150">
              TEAM B
            </span>
            <h4 className="font-black text-slate-900 text-base tracking-tight">{playerB.name}</h4>
            <p className="text-[11px] font-bold text-indigo-650 uppercase font-mono">{playerB.role} • {playerB.state}</p>
          </div>
        </div>

        {/* Head-to-Head Attributes */}
        <div className="py-6 space-y-5">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-6 font-mono">Attribute Comparison Deck</h4>
          
          {compareAttributes.map((attr, idx) => {
            const isReverse = attr.reverse;
            let normA = getNormalizedValue(attr.valA, attr.max);
            let normB = getNormalizedValue(attr.valB, attr.max);

            if (isReverse) {
              normA = attr.valA > 0 ? getNormalizedValue(15 - attr.valA, 15) : 0;
              normB = attr.valB > 0 ? getNormalizedValue(15 - attr.valB, 15) : 0;
            }

            const winner = isReverse 
              ? (attr.valA > 0 && (attr.valB === 0 || attr.valA < attr.valB) ? 'A' : (attr.valB > 0 ? 'B' : 'none'))
              : (attr.valA > attr.valB ? 'A' : (attr.valB > attr.valA ? 'B' : 'none'));

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs px-2">
                  <span className={`font-mono font-bold ${winner === 'A' ? 'text-emerald-600 font-extrabold text-sm flex items-center gap-0.5' : 'text-slate-500'}`}>
                    {winner === 'A' && <Check className="h-3 w-3 inline stroke-[3px]" />}
                    {attr.format(attr.valA)}
                  </span>
                  <span className="font-black text-slate-700 text-xs text-center">{attr.label}</span>
                  <span className={`font-mono font-bold ${winner === 'B' ? 'text-indigo-600 font-extrabold text-sm flex items-center gap-0.5' : 'text-slate-500'}`}>
                    {attr.format(attr.valB)}
                    {winner === 'B' && <Check className="h-3 w-3 inline stroke-[3px]" />}
                  </span>
                </div>
                
                {/* Progress bars split */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Player Bar (starts right, grows left) */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex justify-end">
                    <div 
                      className={`h-full rounded-l-full transition-all duration-300 ${winner === 'A' ? 'bg-gradient-to-l from-emerald-600 to-emerald-400' : 'bg-slate-305'}`} 
                      style={{ width: `${normA}%` }}
                    />
                  </div>
                  {/* Right Player Bar (starts left, grows right) */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-r-full transition-all duration-300 ${winner === 'B' ? 'bg-gradient-to-r from-indigo-600 to-indigo-400' : 'bg-slate-305'}`} 
                      style={{ width: `${normB}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visualized Bar Chart for head to head */}
        <div className="pt-6 border-t border-slate-100">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4 font-mono">Relative Visualized Index</h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Bar dataKey={playerA.name} fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={30} />
                <Bar dataKey={playerB.name} fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
            * Values are scaled for presentation display purposes. Strike rate divided by 2, wickets multiplied by 10.
          </p>
        </div>
      </div>
    </div>
  );
}
