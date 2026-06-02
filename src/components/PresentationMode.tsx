import { useState } from 'react';
import { Player } from '../types';
import { calculateCareerStats, formatBestBowling, isMatchInSeason } from '../utils';
import {
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface PresentationModeProps {
  player: Player;
  selectedSeason: string;
  onClose: () => void;
}

export default function PresentationMode({ player, selectedSeason, onClose }: PresentationModeProps) {
  const [slide, setSlide] = useState(1);

  // Filter matches based on season
  const seasonFilteredMatches = player.matches.filter(
    m => isMatchInSeason(m.date, selectedSeason)
  );

  const stats = calculateCareerStats(seasonFilteredMatches);

  // Chronological sorting for progress charts
  const chronologicalMatches = [...seasonFilteredMatches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const battingTrendData = chronologicalMatches.map((m, index) => ({
    matchIndex: `Match ${index + 1}`,
    opponent: m.opponent,
    runs: m.runsScored !== undefined ? m.runsScored : 0,
    balls: m.ballsFaced !== undefined ? m.ballsFaced : 0,
  }));

  const bowlingTrendData = chronologicalMatches.map((m, index) => ({
    matchIndex: `Match ${index + 1}`,
    opponent: m.opponent,
    wickets: m.wicketsTaken !== undefined ? m.wicketsTaken : 0,
    runsConceded: m.runsConceded !== undefined ? m.runsConceded : 0,
  }));

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col z-50">
      {/* Presentation Header Bar */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl font-black font-mono text-xs uppercase border border-emerald-500/10">
            Slide Deck
          </div>
          <div>
            <h2 className="text-sm font-black font-mono tracking-tight uppercase">Athlete Pitch Mode • {player.name}</h2>
            <p className="text-[10px] text-slate-400 font-mono">Season Filter: <span className="text-emerald-400 font-bold">{selectedSeason}</span></p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700/60 transition-colors cursor-pointer"
        >
          Exit Presentation
        </button>
      </header>

      {/* Main Slide Carousel Viewer Component */}
      <main className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <div className="w-full max-w-4xl bg-slate-900/40 rounded-3xl p-8 border border-slate-800 shadow-3xl min-h-[460px] flex flex-col justify-between">
          
          {/* Slide 1: Athlete General Bio Overviews */}
          {slide === 1 && (
            <div className="grid md:grid-cols-2 gap-8 items-center flex-1">
              <div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 py-1 px-3 rounded-full font-black tracking-widest font-mono uppercase">
                  Athlete Showcase Info
                </span>
                <h3 className="text-4xl font-extrabold text-white mt-4 tracking-tight leading-none">{player.name}</h3>
                <p className="text-xs font-bold text-emerald-400 underline decoration-emerald-500/30 mt-2 font-mono uppercase">
                  {player.role} • {player.state}
                </p>
                <div className="h-[1px] bg-slate-800 my-6" />
                <p className="text-slate-400 text-xs leading-relaxed max-w-sm italic">
                  "{player.bio || 'Representing professional rosters and performance tiers.'}"
                </p>
              </div>
              <div className="flex justify-center">
                {player.imageUrl ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-2xl blur-lg opacity-25" />
                    <img
                      src={player.imageUrl}
                      alt={player.name}
                      referrerPolicy="no-referrer"
                      className="w-56 h-56 object-cover rounded-2xl border border-slate-700/60 shadow-xl relative z-10"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-slate-850 border border-slate-850 flex items-center justify-center text-slate-600 font-mono text-3xl font-black">
                    CRICKET
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Slide 2: Career Statistics Summary Table */}
          {slide === 2 && (
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-[10px] text-amber-400 border border-amber-400/20 py-1 px-3 rounded-full font-black tracking-widest font-mono uppercase w-fit mb-4">
                Career Performance Index
              </span>
              <h3 className="text-2xl font-extrabold text-white mb-6 font-mono">Statistical Ledger Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-bold font-mono block">Matches Played</span>
                  <span className="text-2xl font-black text-white">{stats.matchesCount}</span>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-bold font-mono block">Batting Average</span>
                  <span className="text-2xl font-black text-emerald-400">{stats.battingAverage || '0.00'}</span>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-bold font-mono block">Wickets Taken</span>
                  <span className="text-2xl font-black text-indigo-400">{stats.totalWickets}</span>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-bold font-mono block">Best Bowling</span>
                  <span className="text-lg font-black text-amber-500 font-mono mt-1 block">{formatBestBowling(stats.bestBowling)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-800/50 text-center">
                  <span className="text-[8px] text-slate-500 uppercase font-mono block">Total Runs</span>
                  <span className="text-lg font-black text-slate-300">{stats.totalRuns}</span>
                </div>
                <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-800/50 text-center">
                  <span className="text-[8px] text-slate-500 uppercase font-mono block">Economy Rate</span>
                  <span className="text-lg font-black text-slate-300">{stats.economy || '0.00'}</span>
                </div>
                <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-800/50 text-center">
                  <span className="text-[8px] text-slate-500 uppercase font-mono block">Strike Rate</span>
                  <span className="text-lg font-black text-slate-300">{stats.battingStrikeRate || '0.0%'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Slide 3: Batting Run charts */}
          {slide === 3 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 border border-emerald-400/20 py-1 px-3 rounded-full font-black tracking-widest font-mono uppercase">
                  Batting Progression Graph
                </span>
                <h3 className="text-base font-black text-white mt-2 mb-3 font-mono">Innings Runs Progression</h3>
              </div>

              {battingTrendData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={battingTrendData}>
                      <defs>
                        <linearGradient id="deckRunsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="matchIndex" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 12 }}
                        labelStyle={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 10 }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: 11 }}
                      />
                      <Area type="monotone" dataKey="runs" stroke="#10b981" fillOpacity={1} fill="url(#deckRunsGrad)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-16 text-xs text-slate-600 font-mono">No batting statistics matches found on ledger for this season</p>
              )}
            </div>
          )}

          {/* Slide 4: Bowling progression charts */}
          {slide === 4 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-indigo-400 border border-indigo-400/20 py-1 px-3 rounded-full font-black tracking-widest font-mono uppercase">
                  Bowling Progression Graph
                </span>
                <h3 className="text-base font-black text-white mt-2 mb-3 font-mono">Wickets Claimed Trend</h3>
              </div>

              {bowlingTrendData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bowlingTrendData}>
                      <defs>
                        <linearGradient id="deckWicketsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="matchIndex" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 12 }}
                        labelStyle={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 10 }}
                        itemStyle={{ color: '#6366f1', fontWeight: 'bold', fontSize: 11 }}
                      />
                      <Area type="monotone" dataKey="wickets" stroke="#6366f1" fillOpacity={1} fill="url(#deckWicketsGrad)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-16 text-xs text-slate-600 font-mono">No bowling statistics matches found on ledger for this season</p>
              )}
            </div>
          )}

          {/* Navigation controls footer */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-5 mt-6">
            <span className="text-[10px] text-slate-500 font-mono font-medium">SLIDE {slide} OF 4</span>
            <div className="flex items-center gap-2">
              <button
                disabled={slide === 1}
                onClick={() => setSlide(s => s - 1)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 disabled:opacity-30 rounded-lg text-xs font-bold transition-all disabled:pointer-events-none cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={slide === 4}
                onClick={() => setSlide(s => s + 1)}
                className="px-3 py-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-30 font-black rounded-lg text-xs transition-all disabled:pointer-events-none cursor-pointer"
              >
                Next Slide
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
