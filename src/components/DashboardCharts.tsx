import { useState } from 'react';
import { Player } from '../types';
import { calculateCareerStats, formatDate, isMatchInSeason } from '../utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart, Line, Legend
} from 'recharts';
import { Trash2 } from 'lucide-react';

interface DashboardChartsProps {
  player: Player;
  selectedSeason: string;
  onDeleteMatch: (matchId: string) => void;
}

export default function DashboardCharts({ player, selectedSeason, onDeleteMatch }: DashboardChartsProps) {
  // Filter matches by season
  const seasonFilteredMatches = player.matches.filter(
    m => isMatchInSeason(m.date, selectedSeason)
  );

  const stats = calculateCareerStats(seasonFilteredMatches);

  // Sorting matches chronologically for graphs progress
  const chronologicalMatches = [...seasonFilteredMatches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const battingData = chronologicalMatches.map((m, idx) => ({
    displayIdx: `Innings ${idx + 1}`,
    runs: m.runsScored !== undefined ? m.runsScored : 0,
    balls: m.ballsFaced !== undefined ? m.ballsFaced : 0,
    opponent: m.opponent,
    date: formatDate(m.date),
  }));

  const bowlingData = chronologicalMatches.map((m, idx) => ({
    displayIdx: `Spell ${idx + 1}`,
    wickets: m.wicketsTaken !== undefined ? m.wicketsTaken : 0,
    conceded: m.runsConceded !== undefined ? m.runsConceded : 0,
    opponent: m.opponent,
    date: formatDate(m.date),
  }));

  const [activeTrend, setActiveTrend] = useState<'strikeRate' | 'economy'>(() => {
    return player.role === 'Bowler' ? 'economy' : 'strikeRate';
  });

  const [matchToDeleteId, setMatchToDeleteId] = useState<string | null>(null);

  // Filter matches with valid batting (runsScored !== undefined and ballsFaced > 0)
  const battingMatches = chronologicalMatches.filter(
    m => m.runsScored !== undefined && m.ballsFaced !== undefined && m.ballsFaced > 0
  );

  // Filter matches with valid bowling (oversBowled > 0 and runsConceded !== undefined)
  const bowlingMatches = chronologicalMatches.filter(
    m => m.oversBowled !== undefined && m.oversBowled > 0
  );

  const getBallsFromOvers = (o: number): number => {
    const completed = Math.floor(o);
    const fraction = Math.round((o - completed) * 10);
    return completed * 6 + fraction;
  };

  const rollingBattingData = battingMatches.map((m, idx) => {
    const startIdx = Math.max(0, idx - 4);
    const subset = battingMatches.slice(startIdx, idx + 1);
    
    let sumRuns = 0;
    let sumBalls = 0;
    subset.forEach(s => {
      sumRuns += s.runsScored || 0;
      sumBalls += s.ballsFaced || 0;
    });
    
    const rollingSR = sumBalls > 0 ? parseFloat(((sumRuns / sumBalls) * 100).toFixed(2)) : 0;
    const matchSR = m.ballsFaced && m.ballsFaced > 0 ? parseFloat(((m.runsScored || 0) / m.ballsFaced * 100).toFixed(2)) : 0;
    
    return {
      matchIndex: idx + 1,
      opponent: m.opponent,
      date: formatDate(m.date),
      matchStrikeRate: matchSR,
      rollingStrikeRate: rollingSR,
    };
  });

  const rollingBowlingData = bowlingMatches.map((m, idx) => {
    const startIdx = Math.max(0, idx - 4);
    const subset = bowlingMatches.slice(startIdx, idx + 1);

    let sumRunsConceded = 0;
    let sumBallsBowled = 0;
    subset.forEach(s => {
      sumRunsConceded += s.runsConceded || 0;
      sumBallsBowled += getBallsFromOvers(s.oversBowled || 0);
    });

    const trueOvers = sumBallsBowled / 6;
    const rollingECON = trueOvers > 0 ? parseFloat((sumRunsConceded / trueOvers).toFixed(2)) : 0;
    
    const matchBalls = getBallsFromOvers(m.oversBowled || 0);
    const matchTrueOvers = matchBalls / 6;
    const matchECON = matchTrueOvers > 0 ? parseFloat(((m.runsConceded || 0) / matchTrueOvers).toFixed(2)) : 0;

    return {
      matchIndex: idx + 1,
      opponent: m.opponent,
      date: formatDate(m.date),
      matchEconomy: matchECON,
      rollingEconomy: rollingECON,
    };
  });

  // Dynamic Momentum indicators
  const getStrikeRateMomentum = () => {
    if (rollingBattingData.length < 2) return null;
    const latest = rollingBattingData[rollingBattingData.length - 1].rollingStrikeRate;
    const prev = rollingBattingData[rollingBattingData.length - 2].rollingStrikeRate;
    const diff = latest - prev;
    if (diff > 0) {
      return { text: `Upward (+${diff.toFixed(1)}%)`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' };
    } else if (diff < 0) {
      return { text: `Downward (${diff.toFixed(1)}%)`, color: 'text-rose-400 bg-rose-500/10 border-rose-500/25' };
    }
    return { text: 'Stable', color: 'text-slate-400 bg-slate-500/10 border-slate-500/25' };
  };

  const getEconomyMomentum = () => {
    if (rollingBowlingData.length < 2) return null;
    const latest = rollingBowlingData[rollingBowlingData.length - 1].rollingEconomy;
    const prev = rollingBowlingData[rollingBowlingData.length - 2].rollingEconomy;
    const diff = latest - prev; // In economy, lower is better. So diff < 0 is improvement.
    if (diff < 0) {
      return { text: `Improving (${diff.toFixed(2)})`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' };
    } else if (diff > 0) {
      return { text: `Declining (+${diff.toFixed(2)})`, color: 'text-rose-400 bg-rose-500/10 border-rose-500/25' };
    }
    return { text: 'Stable', color: 'text-slate-400 bg-slate-500/10 border-slate-500/25' };
  };

  const srMomentum = getStrikeRateMomentum();
  const econMomentum = getEconomyMomentum();

  const handleDelete = (matchId: string) => {
    setMatchToDeleteId(matchId);
  };

  return (
    <div className="space-y-6">
      {/* Mini Cards stats indicator */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Batting Ave */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-500 font-mono text-5xl font-black">BAT</div>
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider block">Batting Rank Avg</span>
          <span className="text-2xl font-black text-white mt-1 block">{stats.battingAverage || '0.00'}</span>
          <p className="text-[10px] text-slate-500 font-mono mt-1 leading-none">
            Runs Scored: <strong className="text-emerald-400">{stats.totalRuns}</strong>
          </p>
        </div>

        {/* Batting SR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-500 font-mono text-5xl font-black">S/R</div>
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider block">Batting Strike Rate</span>
          <span className="text-2xl font-black text-white mt-1 block">{stats.battingStrikeRate ? `${stats.battingStrikeRate}%` : '0.00%'}</span>
          <p className="text-[10px] text-slate-500 font-mono mt-1 leading-none">
            Balls Faced: <strong className="text-emerald-400">{stats.totalBalls}</strong>
          </p>
        </div>

        {/* Bowling Wickets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-500 font-mono text-5xl font-black">WKTS</div>
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider block">Career Wickets</span>
          <span className="text-2xl font-black text-white mt-1 block">{stats.totalWickets}</span>
          <p className="text-[10px] text-slate-500 font-mono mt-1 leading-none">
            Best Bowl: <strong className="text-indigo-400">{stats.bestBowling ? `${stats.bestBowling.wickets}/${stats.bestBowling.runs}` : 'N/A'}</strong>
          </p>
        </div>

        {/* Economy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-500 font-mono text-5xl font-black">ECON</div>
          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider block">Bowling Economy</span>
          <span className="text-2xl font-black text-white mt-1 block">{stats.economy || '0.00'}</span>
          <p className="text-[10px] text-slate-500 font-mono mt-1 leading-none">
            Overs Cast: <strong className="text-indigo-400">{stats.totalOvers}</strong>
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Runs over time */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider font-mono">Runs Scored Trend</h4>
            <p className="text-[10px] text-slate-500 font-mono mb-4">Chronological runs and ball count over recent matches</p>
          </div>
          {battingData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={battingData}>
                  <defs>
                    <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="displayIdx" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 12 }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    itemStyle={{ fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey="runs" name="Runs" stroke="#10b981" fillOpacity={1} fill="url(#runsGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-16 text-xs text-slate-600 font-mono">No batting statistics matching filters</p>
          )}
        </div>

        {/* Wickets over time */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider font-mono">Wickets Claimed trend</h4>
            <p className="text-[10px] text-slate-500 font-mono mb-4">Spell wickets and conceding matches</p>
          </div>
          {bowlingData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bowlingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="displayIdx" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 12 }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    itemStyle={{ fontSize: 11 }}
                  />
                  <Bar dataKey="wickets" name="Wickets" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-16 text-xs text-slate-600 font-mono">No bowling statistics matching filters</p>
          )}
        </div>
      </div>

      {/* Recent Form Rolling 5-Match Trend Line Chart Component */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-widest font-mono">Form Velocity (Rolling 5-Match Trend)</h4>
              
              {activeTrend === 'strikeRate' && srMomentum && (
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold border ${srMomentum.color}`}>
                  {srMomentum.text}
                </span>
              )}
              {activeTrend === 'economy' && econMomentum && (
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold border ${econMomentum.color}`}>
                  {econMomentum.text}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Visualizes rolling five-match performance metrics to trace performance momentum and recent player trajectory
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl self-start sm:self-auto border border-slate-800">
            <button
              onClick={() => setActiveTrend('strikeRate')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeTrend === 'strikeRate'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strike Rate
            </button>
            <button
              onClick={() => setActiveTrend('economy')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeTrend === 'economy'
                  ? 'bg-indigo-500 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Economy Rate
            </button>
          </div>
        </div>

        {activeTrend === 'strikeRate' ? (
          rollingBattingData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rollingBattingData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="matchIndex" tickFormatter={(v) => `Innings ${v}`} stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 12 }}
                    labelFormatter={(label, items) => {
                      const item = items[0]?.payload;
                      return item ? `${item.date} vs ${item.opponent}` : `Innings ${label}`;
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    itemStyle={{ fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'monospace', paddingTop: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey="matchStrikeRate" 
                    name="Innings Strike Rate" 
                    stroke="#38bdf8" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: '#0f172a', strokeWidth: 1.5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rollingStrikeRate" 
                    name="5-Match Strike Rate Avg" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-16 text-xs text-slate-500 font-mono bg-slate-950/20 rounded-2xl border border-dashed border-slate-800">
              Insufficient innings recorded matching the filters to plot the 5-match striking rate.
            </p>
          )
        ) : (
          rollingBowlingData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rollingBowlingData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="matchIndex" tickFormatter={(v) => `Spell ${v}`} stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 12 }}
                    labelFormatter={(label, items) => {
                      const item = items[0]?.payload;
                      return item ? `${item.date} vs ${item.opponent}` : `Spell ${label}`;
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    itemStyle={{ fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'monospace', paddingTop: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey="matchEconomy" 
                    name="Match Economy" 
                    stroke="#f43f5e" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: '#0f172a', strokeWidth: 1.5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rollingEconomy" 
                    name="5-Match Economy Avg (Lower is Better)" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-16 text-xs text-slate-500 font-mono bg-slate-950/20 rounded-2xl border border-dashed border-slate-800">
              Insufficient overs bowled matching the filters to plot the 5-match economy average.
            </p>
          )
        )}
      </div>

      {/* Match Ledger Records Table List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider font-mono">Match Performance History</h4>
            <p className="text-[10px] text-slate-500 font-mono">Detailed breakdown of games played in this season filter</p>
          </div>
          <span className="text-[9px] text-slate-500 font-mono font-bold bg-slate-950 px-2 py-1 rounded-md">
            {seasonFilteredMatches.length} RECORDS
          </span>
        </div>

        {seasonFilteredMatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Opponent</th>
                  <th className="py-2.5 px-3">Batting (R/B)</th>
                  <th className="py-2.5 px-3">Bowling (W/O/R)</th>
                  <th className="py-2.5 px-3">Fielding (C/S)</th>
                  <th className="py-2.5 px-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {seasonFilteredMatches.map((m) => {
                  const runs = m.runsScored !== undefined ? m.runsScored : '-';
                  const balls = m.ballsFaced !== undefined ? m.ballsFaced : '-';
                  const outStr = m.runsScored !== undefined ? (m.isOut ? 'out' : 'n.o.') : '';

                  const wickets = m.wicketsTaken !== undefined ? m.wicketsTaken : '-';
                  const overs = m.oversBowled !== undefined ? m.oversBowled : '-';
                  const cleanConceded = m.runsConceded !== undefined ? m.runsConceded : '-';

                  return (
                    <tr key={m.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{formatDate(m.date)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-100">{m.opponent}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-300">
                        {runs !== '-' ? (
                          <span>{runs} Runs ({balls}b) <span className="text-[10px] text-slate-500 lowercase">({outStr})</span></span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-300">
                        {wickets !== '-' ? (
                          <span>{wickets} Wkts / {overs} ov ({cleanConceded}r)</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {m.catches !== undefined || m.stumpings !== undefined ? (
                          <span>C: {m.catches || 0} • S: {m.stumpings || 0}</span>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 rounded-md text-[10px] font-bold font-mono uppercase transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-10 text-xs text-slate-600 font-mono bg-slate-950/10 rounded-2xl border border-dashed border-slate-800">
            No recording parameters defined. Add a performance match entry card above.
          </p>
        )}
      </div>

      {/* Safe Match Deletion Modal */}
      {matchToDeleteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-mono uppercase text-slate-200">Delete Match Entry</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to delete this match record? All career stats, rolling trends, and historical metrics will re-aggregate immediately.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMatchToDeleteId(null)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-bold leading-none cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteMatch(matchToDeleteId);
                  setMatchToDeleteId(null);
                }}
                className="flex-1 py-1.5 bg-red-500 hover:bg-red-400 text-slate-950 font-black uppercase tracking-wider rounded-xl text-xs leading-none cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
