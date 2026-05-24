/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Player } from '../types';
import { calculateCareerStats, formatDate, formatBestBowling, isMatchInSeason } from '../utils';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts';
import { 
  Play, Pause, ChevronLeft, ChevronRight, Maximize2, 
  Presentation, Zap, Target, Award, Star
} from 'lucide-react';

interface PresentationModeProps {
  player: Player;
  selectedSeason?: string;
  onClose: () => void;
}

type SlideId = 'overview' | 'batting_runs' | 'batting_sr' | 'bowling_wickets' | 'bowling_economy';

export default function PresentationMode({ player, selectedSeason = 'All', onClose }: PresentationModeProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Filter matches by season first
  const seasonFilteredMatches = player.matches.filter(
    m => isMatchInSeason(m.date, selectedSeason)
  );

  const stats = calculateCareerStats(seasonFilteredMatches);

  // Filter and sort chronologically
  const activeMatches = [...seasonFilteredMatches]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Structured slide list
  const slides: { id: SlideId; title: string; subtitle: string; icon: any }[] = [
    { 
      id: 'overview', 
      title: `${player.name} — Career Summary Scorecard`, 
      subtitle: 'Overview of matches, batting, and bowling metrics', 
      icon: Star 
    },
    ...(stats.inningsBatted > 0 ? [
      { 
        id: 'batting_runs' as SlideId, 
        title: 'Batting Performance Form Dynamics', 
        subtitle: 'Chronological timeline of individual match runs scored and consistency', 
        icon: Target 
      },
      { 
        id: 'batting_sr' as SlideId, 
        title: 'Strike Rate & Scoring Intent', 
        subtitle: 'Analyzing balls faced in relation to runs scored over matches', 
        icon: Zap 
      }
    ] : []),
    ...(stats.inningsBowled > 0 ? [
      { 
        id: 'bowling_wickets' as SlideId, 
        title: 'Bowling Economy & Control Deck', 
        subtitle: 'Analysis of runs conceded vs overs bowled chronologically', 
        icon: Award 
      },
      { 
        id: 'bowling_economy' as SlideId, 
        title: 'Wickets Production Rate', 
        subtitle: 'Distribution of wickets taken in match profiles', 
        icon: Presentation 
      }
    ] : [])
  ];

  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Auto advance timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Batting data
  const battingData = activeMatches
    .filter(m => !m.didNotBat)
    .map((m, idx) => ({
      name: `Innings ${idx + 1}`,
      runs: m.runsScored,
      balls: m.ballsFaced,
      opponent: m.opponent,
      sr: m.ballsFaced > 0 ? Number(((m.runsScored / m.ballsFaced) * 100).toFixed(1)) : 0,
      isOut: m.isOut,
      date: formatDate(m.date),
    }));

  // Bowling data
  const bowlingData = activeMatches
    .filter(m => !m.didNotBowl)
    .map((m, idx) => {
      // Calculate economy rate
      const completedOvers = Math.floor(m.oversBowled);
      const remainingBalls = Math.round((m.oversBowled % 1) * 10);
      const totalBalls = completedOvers * 6 + Math.min(remainingBalls, 5);
      const economy = totalBalls > 0 ? Number(((m.runsConceded / totalBalls) * 6).toFixed(2)) : 0;
      return {
        name: `Spell ${idx + 1}`,
        wickets: m.wicketsTaken,
        runs: m.runsConceded,
        opponent: m.opponent,
        economy: economy,
        overs: m.oversBowled,
        date: formatDate(m.date),
      };
    });

  const renderSlideContent = () => {
    switch (currentSlide.id) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-full items-center">
            {/* Biography & General info */}
            <div className="col-span-1 border border-slate-800 bg-slate-900/30 rounded-2xl p-6 text-slate-300 flex flex-col justify-between h-96">
              <div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800 uppercase tracking-widest font-mono">
                  Athlete Profile Info
                </span>
                <h4 className="text-2xl font-black text-white mt-4 tracking-tight">{player.name}</h4>
                <p className="text-xs font-bold text-emerald-450 underline decoration-emerald-555 mt-1 font-mono uppercase">{player.role} • {player.state}</p>
                <div className="h-[1px] bg-slate-800 my-4" />
                <p className="text-xs leading-relaxed text-slate-400">
                  {player.bio || "No biography overview defined. Input professional descriptions block under active profiles details."}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between uppercase tracking-wider font-extrabold border-t border-slate-800/60 pt-3">
                <span>Total Matches Tracked:</span>
                <span className="text-emerald-450 font-bold font-mono text-xs">{stats.totalMatches}</span>
              </div>
            </div>

            {/* Batting highlight scorecard */}
            <div className="col-span-1 border border-slate-800 bg-slate-900/30 rounded-2xl p-6 text-slate-300 flex flex-col justify-between h-96">
              <div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800 uppercase tracking-widest font-mono">
                  Batting Performance index
                </span>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono tracking-wider">Career runs</span>
                    <span className="text-3xl font-mono font-black text-white">{stats.totalRuns}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono tracking-wider">Innings Batted</span>
                    <span className="text-3xl font-mono font-black text-white">{stats.inningsBatted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono tracking-wider">Bat Average</span>
                    <span className="text-3xl font-mono font-black text-emerald-450">{stats.battingAverage}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono tracking-wider">Strike Rate</span>
                    <span className="text-3xl font-mono font-black text-emerald-450">{stats.battingStrikeRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-lg text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono">Highest Scores:</span>
                  <span className="font-bold text-white font-mono">{stats.highestScore}*</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono">Century / 50s Tally:</span>
                  <span className="font-bold text-white font-mono">{stats.hundreds} / {stats.fifties}</span>
                </div>
              </div>
            </div>

            {/* Bowling highlight card */}
            <div className="col-span-1 border border-slate-800 bg-slate-900/30 rounded-2xl p-6 text-slate-300 flex flex-col justify-between h-96">
              <div>
                <span className="text-[10px] font-black text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-900/90 uppercase tracking-widest font-mono">
                  Bowling Performance Index
                </span>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono tracking-wider">Total Wickets</span>
                    <span className="text-3xl font-mono font-black text-white">{stats.totalWickets}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono tracking-wider">Overs Bowled</span>
                    <span className="text-3xl font-mono font-black text-white">{stats.totalOvers}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono tracking-wider">Eco Rate</span>
                    <span className="text-3xl font-mono font-black text-indigo-400">{stats.bowlingEconomy}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono tracking-wider">Bowl Avg</span>
                    <span className="text-3xl font-mono font-black text-indigo-400">{stats.bowlingStrikeRate}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-lg text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono">Best Bowling spell:</span>
                  <span className="font-bold text-white font-mono">{formatBestBowling(stats.bestBowling)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono">Per Wicket Average:</span>
                  <span className="font-bold text-white font-mono">{stats.bowlingAverage || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'batting_runs':
        return (
          <div className="space-y-4 h-full">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="font-mono">Overall Match Runs Trace & Trend (Line visualization)</span>
              <span className="text-emerald-400 font-mono">Batting Average: {stats.battingAverage} runs</span>
            </div>
            <div className="h-96 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={battingData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="presRunsColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="opponent" stroke="#4b5563" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip wrapperStyle={{ outline: 'none' }} labelStyle={{ color: '#000' }} />
                  <ReferenceLine y={stats.battingAverage} stroke="#10b981" strokeDasharray="6 6" label={{ value: 'Avg', fill: '#10b981', position: 'insideRight', fontSize: 11, fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="runs" name="Runs" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#presRunsColor)" dot={{ r: 6, fill: '#10b981', stroke: '#0a0a0a', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'batting_sr':
        return (
          <div className="space-y-4 h-full">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="font-mono">Strike Rate (S/R) and Intensity bar distribution per Match</span>
              <span className="text-emerald-400 font-mono">Overall Career S/R: {stats.battingStrikeRate}%</span>
            </div>
            <div className="h-96 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={battingData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="opponent" stroke="#4b5563" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip labelStyle={{ color: '#000' }} />
                  <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '100.0 S/R', fill: '#f59e0b', fontSize: 11 }} />
                  <Bar dataKey="sr" name="Innings Strike Rate" fill="#047857" maxBarSize={55} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'bowling_wickets':
        return (
          <div className="space-y-4 h-full">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="font-mono">Runs Conceded vs. Intensity Of Spells (Overs Bowled)</span>
              <span className="text-indigo-400 font-mono">Overall Economy: {stats.bowlingEconomy} runs/over</span>
            </div>
            <div className="h-96 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bowlingData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="presEcoColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="opponent" stroke="#4b5563" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip labelStyle={{ color: '#000' }} />
                  <ReferenceLine y={stats.bowlingEconomy} stroke="#6366f1" strokeDasharray="5 5" label={{ value: 'Eco Avg', fill: '#6366f1', fontSize: 11 }} />
                  <Area type="monotone" dataKey="economy" name="Economy Rate" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#presEcoColor)" dot={{ r: 6, fill: '#6366f1' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'bowling_economy':
        return (
          <div className="space-y-4 h-full">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="font-mono">Wickets Captured Tally per Opposition Innings</span>
              <span className="text-emerald-400 font-mono">Total Career Wickets: {stats.totalWickets}</span>
            </div>
            <div className="h-96 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bowlingData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="opponent" stroke="#4b5563" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip labelStyle={{ color: '#000' }} />
                  <Bar dataKey="wickets" name="Wickets Captured" fill="#10b981" maxBarSize={55} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-[#090d13] text-white z-50 flex flex-col justify-between p-6 overflow-hidden select-none font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="p-2 bg-slate-950 text-emerald-450 rounded-lg border border-slate-850">
            <Presentation className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black font-mono block">
              Active Performance Deck
            </span>
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-tight">{currentSlide.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Controls */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider font-mono border flex items-center gap-1.5 transition-all text-white cursor-pointer ${
              isPlaying ? 'bg-emerald-500 border-transparent text-slate-950' : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 fill-slate-950" />
                <span>Pause autoplay</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Auto-play deck</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-800 text-slate-450 hover:text-white rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-900 transition-colors cursor-pointer uppercase tracking-wider font-mono"
          >
            Exit Slide View
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 my-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
        <div className="flex items-center gap-2 mb-2">
          <currentSlide.icon className="h-6 w-6 text-emerald-400" />
          <h4 className="text-xl font-black text-white uppercase tracking-tight">
            {currentSlide.title}
          </h4>
        </div>
        <p className="text-xs text-slate-400 mb-6 font-mono font-medium">{currentSlide.subtitle}</p>

        <div className="bg-[#0b131f]/50 p-6 rounded-3xl border border-slate-850 h-[460px]">
          {renderSlideContent()}
        </div>
      </div>

      {/* Slide Navigation footer */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4 max-w-7xl mx-auto w-full">
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlideIndex(i)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentSlideIndex === i ? 'w-8 bg-emerald-500' : 'w-2.5 bg-slate-800 hover:bg-slate-700'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-mono">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
