/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Player, MatchPerformance } from '../types';
import { calculateCareerStats, formatDate, isMatchInSeason } from '../utils';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Activity, BarChart3, Database, Calendar, Trash2, 
  Sparkles, Award, EyeOff, ShieldAlert 
} from 'lucide-react';

interface DashboardChartsProps {
  player: Player;
  onDeleteMatch: (playerId: string, matchId: string) => void;
  selectedSeason?: string;
}

type ChartTab = 'batting' | 'bowling' | 'trajectory' | 'ledger';

export default function DashboardCharts({ player, onDeleteMatch, selectedSeason = 'All' }: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('batting');
  const [formatFilter, setFormatFilter] = useState<'All' | 'T20' | 'ODI' | 'Test'>('All');

  // Filter matches by season first
  const seasonFilteredMatches = player.matches.filter(
    m => isMatchInSeason(m.date, selectedSeason)
  );

  const stats = calculateCareerStats(seasonFilteredMatches);

  // Filter match performances
  const filteredMatches = seasonFilteredMatches
    .filter(m => formatFilter === 'All' || m.format === formatFilter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // chronological order

  // Process batting data for graphs
  const battingData = filteredMatches
    .filter(m => !m.didNotBat)
    .map((m, index) => {
      const strikeRate = m.ballsFaced > 0 ? Number(((m.runsScored / m.ballsFaced) * 100).toFixed(1)) : 0;
      return {
        matchNum: `Match ${index + 1}`,
        opponent: m.opponent,
        runs: m.runsScored,
        balls: m.ballsFaced,
        strikeRate: strikeRate,
        isOut: m.isOut,
        format: m.format,
        date: formatDate(m.date),
      };
    });

  // Process bowling data for graphs
  const bowlingData = filteredMatches
    .filter(m => !m.didNotBowl)
    .map((m, index) => {
      // Economy rate: runs conceded per over (6 balls)
      const balls = Math.floor(m.oversBowled) * 6 + Math.round((m.oversBowled % 1) * 10);
      const economy = balls > 0 ? Number(((m.runsConceded / balls) * 6).toFixed(2)) : 0;
      return {
        matchNum: `Match ${index + 1}`,
        opponent: m.opponent,
        wickets: m.wicketsTaken,
        conceded: m.runsConceded,
        overs: m.oversBowled,
        economy: economy,
        format: m.format,
        date: formatDate(m.date),
      };
    });

  // Career progressive / trajectories
  let cumulativeRuns = 0;
  let cumulativeWickets = 0;
  const trajectoryData = filteredMatches.map((m, index) => {
    if (!m.didNotBat) cumulativeRuns += m.runsScored;
    if (!m.didNotBowl) cumulativeWickets += m.wicketsTaken;
    return {
      matchLabel: `#${index + 1} (${m.format})`,
      opponent: m.opponent,
      totalRuns: cumulativeRuns,
      totalWickets: cumulativeWickets,
      runsScored: m.didNotBat ? 0 : m.runsScored,
      wicketsTaken: m.didNotBowl ? 0 : m.wicketsTaken,
      date: formatDate(m.date),
    };
  });

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-900 border border-neutral-800 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
          <p className="font-semibold text-neutral-300">{data.opponent} ({data.format || 'Match'})</p>
          <p className="text-neutral-400 font-mono">{data.date}</p>
          {payload.map((item: any, i: number) => (
            <p key={i} style={{ color: item.color }} className="font-medium flex justify-between gap-4">
              <span>{item.name}:</span>
              <span className="font-bold">{item.value}</span>
            </p>
          ))}
          {data.isOut !== undefined && (
            <p className="text-neutral-400 mt-1">
              Dismissal Status: <span className={data.isOut ? "text-amber-400" : "text-emerald-400 font-bold"}>{data.isOut ? "Out" : "Not Out *"}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="analytics-section" className="bg-white rounded-2xl border border-slate-200/95 shadow-md p-6 space-y-6">
      
      {/* Analytics Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-1.5 font-sans tracking-tight uppercase">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Performance Visualizations
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Interactive presentation-ready graphs for {player.name}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Format:</span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            {(['All', 'T20', 'ODI', 'Test'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormatFilter(fmt)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  formatFilter === fmt
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs list navigation with High Density colors */}
      <div className="flex items-center gap-1 border-b border-slate-150 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('batting')}
          disabled={stats.inningsBatted === 0}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            stats.inningsBatted === 0 ? 'opacity-30 cursor-not-allowed border-transparent' :
            activeTab === 'batting' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/15' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'
          }`}
        >
          <Sparkles className="h-4 w-4 text-emerald-500" />
          Batting Form
        </button>
        <button
          onClick={() => setActiveTab('bowling')}
          disabled={stats.inningsBowled === 0}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            stats.inningsBowled === 0 ? 'opacity-30 cursor-not-allowed border-transparent' :
            activeTab === 'bowling' ? 'border-indigo-500 text-indigo-650 bg-indigo-50/15' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'
          }`}
        >
          <Award className="h-4 w-4 text-indigo-550" />
          Bowling Form
        </button>
        <button
          onClick={() => setActiveTab('trajectory')}
          disabled={player.matches.length === 0}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            player.matches.length === 0 ? 'opacity-30 cursor-not-allowed border-transparent' :
            activeTab === 'trajectory' ? 'border-slate-850 text-slate-900 bg-slate-50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'
          }`}
        >
          <Activity className="h-4 w-4 text-slate-700" />
          Career Growth Trend
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all ml-auto cursor-pointer ${
            activeTab === 'ledger' ? 'border-rose-500 text-rose-650 bg-rose-50/15' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'
          }`}
        >
          <Database className="h-4 w-4 text-rose-500" />
          Preloaded Match Logs ({player.matches.length})
        </button>
      </div>

      {/* Graphs canvas */}
      <div className="min-h-[350px]">
        {player.matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-orange-50 border border-orange-150 rounded-full mb-3 text-orange-600">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-neutral-800 text-base">No Matches Logged</h4>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              Add match statistics using the <strong>"Add Match Performance"</strong> button to generate graphs.
            </p>
          </div>
        ) : activeTab === 'batting' && battingData.length > 0 ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Chart 1: Batting runs timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between font-mono">
                  <span>Match Runs Timeline</span>
                  <span className="text-emerald-600 font-mono">Average: {stats.battingAverage} runs</span>
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={battingData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
                      <XAxis dataKey="opponent" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip content={customTooltip} />
                      <ReferenceLine y={stats.battingAverage} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Career Avg', position: 'insideRight', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
                      <Line 
                        type="monotone" 
                        dataKey="runs" 
                        name="Runs Scored" 
                        stroke="#059669" 
                        strokeWidth={3} 
                        activeDot={{ r: 8 }} 
                        dot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Batting strike rate bar chart */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between font-mono">
                  <span>Innings Strike Rate (S/R)</span>
                  <span className="text-emerald-600 font-mono">Overall S/R: {stats.battingStrikeRate}%</span>
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={battingData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
                      <XAxis dataKey="opponent" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip content={customTooltip} />
                      <ReferenceLine y={100} stroke="#475569" strokeDasharray="4 4" label={{ value: '100 S/R Mark', position: 'insideLeft', fill: '#475569', fontSize: 10 }} />
                      <Bar dataKey="strikeRate" name="Strike Rate" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'bowling' && bowlingData.length > 0 ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Wickets & Runs conceded */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between font-mono">
                  <span>Wickets Trapped vs Conceded</span>
                  <span className="text-emerald-600 font-mono">Best: {stats.bestBowling ? `${stats.bestBowling.wickets}/${stats.bestBowling.runs}` : 'N/A'}</span>
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bowlingData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
                      <XAxis dataKey="opponent" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis yAxisId="left" orientation="left" stroke="#10b981" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#6366f1" tick={{ fontSize: 10 }} />
                      <Tooltip content={customTooltip} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                      <Bar yAxisId="left" dataKey="wickets" name="Wickets Taken" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Bar yAxisId="right" dataKey="conceded" name="Runs Conceded" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Economy Rate timeline */}
              <div className="border border-slate-105 rounded-xl p-4 bg-slate-50/30">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between font-mono">
                  <span>Economy Rate Match-wise</span>
                  <span className="text-indigo-600 font-mono">Overall Economy: {stats.bowlingEconomy}</span>
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bowlingData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorEcon" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
                      <XAxis dataKey="opponent" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip content={customTooltip} />
                      <ReferenceLine y={stats.bowlingEconomy} stroke="#6366f1" strokeDasharray="4 4" label={{ value: 'Avg Eco', fill: '#6366f1', fontSize: 10, fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="economy" name="Economy Rate" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEcon)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'trajectory' ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Cumulative growth trajectory */}
            <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/30">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-5 font-mono">
                Cumulative Performance Career Graph (Chronological)
              </h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWickets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
                    <XAxis dataKey="opponent" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis yAxisId="runs" orientation="left" stroke="#10b981" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="wickets" orientation="right" stroke="#6366f1" tick={{ fontSize: 10 }} />
                    <Tooltip content={customTooltip} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontFamily: 'monospace' }} />
                    <Area yAxisId="runs" type="monotone" dataKey="totalRuns" name="Cumulative Runs Scored" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRuns)" />
                    <Area yAxisId="wickets" type="monotone" dataKey="totalWickets" name="Cumulative Wickets Taken" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorWickets)" strokeDasharray="3 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : activeTab === 'ledger' ? (
          <div className="border border-slate-200/90 rounded-xl overflow-hidden animate-in fade-in duration-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Opponent</th>
                    <th className="py-3 px-4 text-center">Format</th>
                    <th className="py-3 px-4 text-right font-mono">Runs (Balls)</th>
                    <th className="py-3 px-4 text-center">Dismissal</th>
                    <th className="py-3 px-4 text-center font-mono">Overs</th>
                    <th className="py-3 px-4 text-right font-mono">Conceded</th>
                    <th className="py-3 px-4 text-center font-mono">Wickets</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-705">
                  {[...seasonFilteredMatches]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // latest first for logs
                    .map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-4 font-medium whitespace-nowrap text-slate-500">{formatDate(m.date)}</td>
                        <td className="py-2.5 px-4 font-extrabold text-slate-900">{m.opponent}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.format === 'T20' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            m.format === 'ODI' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-slate-100 text-slate-800 border border-slate-200/60'
                          }`}>
                            {m.format}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                          {m.didNotBat ? (
                            <span className="text-slate-300 italic font-normal">DNB</span>
                          ) : (
                            `${m.runsScored} (${m.ballsFaced})`
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {!m.didNotBat && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              m.isOut ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-150'
                            }`}>
                              {m.isOut ? 'Out' : 'Not Out'}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-medium text-slate-600">
                          {m.didNotBowl ? <span className="text-slate-300 italic font-normal">DNB</span> : m.oversBowled}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-600">
                          {m.didNotBowl ? <span className="text-slate-300 italic font-normal">DNB</span> : m.runsConceded}
                        </td>
                        <td className="py-2.5 px-4 text-center font-black text-emerald-750 font-mono">
                          {m.didNotBowl ? <span className="text-slate-300 font-normal italic">DNB</span> : m.wicketsTaken}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => onDeleteMatch(player.id, m.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 transition-all cursor-pointer"
                            title="Delete match data"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
            <EyeOff className="h-8 w-8 text-neutral-400 mb-2" />
            <p className="text-sm">No data available for the selected format filter ({formatFilter}).</p>
          </div>
        )}
      </div>
    </div>
  );
}
