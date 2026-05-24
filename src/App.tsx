/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Player, MatchPerformance } from './types';
import { INITIAL_PLAYERS } from './initialData';
import { calculateCareerStats, formatBestBowling, getSeasonFromDate, isMatchInSeason } from './utils';

// Import sub components
import PlayerForm from './components/PlayerForm';
import MatchForm from './components/MatchForm';
import DashboardCharts from './components/DashboardCharts';
import PlayerComparison from './components/PlayerComparison';
import PresentationMode from './components/PresentationMode';

// Icon imports
import { 
  UserPlus, Award, Presentation, Trophy, RotateCcw, Trash2, 
  Plus, Users, Sparkles, Target, Zap, Shield, HelpCircle, 
  MapPin, CheckCircle, Flame, X, Calendar
} from 'lucide-react';

export default function App() {
  // Load initial players from localStorage or default
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('cricket_perf_analytics_players');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed reading saved players', e);
      }
    }
    return INITIAL_PLAYERS;
  });

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [activeView, setActiveView] = useState<'dashboard' | 'comparison'>('dashboard');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    type?: 'danger' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  // Reset selected season to 'All' when active player changes
  useEffect(() => {
    setSelectedSeason('All');
  }, [selectedPlayerId]);

  const requestConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; type?: 'danger' | 'warning' }
  ) => {
    setConfirmDialog({
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText || 'Confirm',
      type: options?.type || 'danger',
    });
  };

  // Persist players array whenever it changes
  useEffect(() => {
    localStorage.setItem('cricket_perf_analytics_players', JSON.stringify(players));
    // Default to first player if none selected
    if (players.length > 0 && !selectedPlayerId) {
      setSelectedPlayerId(players[0].id);
    }
  }, [players, selectedPlayerId]);

  const activePlayer = players.find(p => p.id === selectedPlayerId) || players[0];

  // Get all unique seasons (like 2026-27) from active player's matches
  const availableSeasons: string[] = activePlayer
    ? Array.from<string>(new Set(activePlayer.matches.map(m => getSeasonFromDate(m.date))))
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a))
    : [];

  const handleAddPlayer = (newPlayerData: Omit<Player, 'matches'>) => {
    const player: Player = {
      ...newPlayerData,
      matches: [],
    };
    setPlayers(prev => [player, ...prev]);
    setSelectedPlayerId(player.id);
  };

  const handleDeletePlayer = (playerId: string) => {
    const playerToDelete = players.find(p => p.id === playerId);
    const name = playerToDelete ? playerToDelete.name : 'this player';
    requestConfirmation(
      'Delete Athlete Profile',
      `Are you absolutely sure you want to delete ${name}? All stored career match histories will be permanently wiped. This action is irreversible.`,
      () => {
        const remaining = players.filter(p => p.id !== playerId);
        setPlayers(remaining);
        if (selectedPlayerId === playerId) {
          setSelectedPlayerId(remaining[0]?.id || '');
        }
      },
      { confirmText: 'Yes, Delete Profile', type: 'danger' }
    );
  };

  const handleDeleteMatch = (playerId: string, matchId: string) => {
    requestConfirmation(
      'Delete Match Performance',
      'Are you sure you want to permanently delete this match performance data? Your career stats and trend graphs will update immediately.',
      () => {
        setPlayers(prev => prev.map(p => {
          if (p.id === playerId) {
            return {
              ...p,
              matches: p.matches.filter(m => m.id !== matchId)
            };
          }
          return p;
        }));
      },
      { confirmText: 'Delete Match', type: 'danger' }
    );
  };

  const handleAddMatch = (newMatch: MatchPerformance) => {
    if (!selectedPlayerId) return;
    setPlayers(prev => prev.map(p => {
      if (p.id === selectedPlayerId) {
        return {
          ...p,
          matches: [newMatch, ...p.matches]
        };
      }
      return p;
    }));
  };

  const handleResetData = () => {
    requestConfirmation(
      'Restore Baseline Data',
      'Are you sure you want to restore default preloaded sample athletes and clear any custom modifications or newly added players?',
      () => {
        setPlayers(INITIAL_PLAYERS);
        setSelectedPlayerId(INITIAL_PLAYERS[0].id);
        setResetMessage('Database restored successfully!');
        setTimeout(() => setResetMessage(''), 3000);
      },
      { confirmText: 'Restore Defaults', type: 'warning' }
    );
  };

  // Filter matches for career stats based on selected season
  const filteredMatchesForStats = activePlayer
    ? activePlayer.matches.filter(m => isMatchInSeason(m.date, selectedSeason))
    : [];

  // Compute active stats
  const activeStats = activePlayer ? calculateCareerStats(filteredMatchesForStats) : null;

  return (
    <div className="min-h-screen bg-neutral-50/40 text-neutral-800 flex flex-col antialiased">
      
      {/* Visual Top Branding Header Banner */}
      <header className="bg-slate-950 border-b border-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shadow-md text-white sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
            <Trophy className="h-6 w-6 text-emerald-400 fill-emerald-500/20" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase font-sans">
              CREX <span className="text-emerald-400">ANALYTICA</span>
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wider font-mono">ELITE CRICKET PERFORMANCE ANALYTICS LEDGER</p>
          </div>
        </div>

        {/* Outer navigation / actions */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Athlete Profile View
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'comparison'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Dual head-to-head Index
          </button>

          <button
            onClick={() => setShowHowToUse(true)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-900 transition-colors cursor-pointer border border-dashed border-emerald-500/20 bg-emerald-500/5 font-sans"
            title="Read application tutorial guide"
          >
            <HelpCircle className="h-4 w-4 text-emerald-400" />
            <span>How to Use</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800" />

          <button
            onClick={handleResetData}
            title="Restore preloaded sample players"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden lg:inline">Reset Baseline</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Reset notify toast popup */}
        {resetMessage && (
          <div className="fixed bottom-6 right-6 bg-neutral-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-neutral-850 flex items-center gap-2 z-50 animate-bounce">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Column Left: Side-docked player list for selecting visual context */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-slate-100 text-sm tracking-wide">Roster Profiles ({players.length})</h3>
                <p className="text-[10px] text-slate-400 font-mono">Select athlete to load metrics</p>
              </div>
              <button
                onClick={() => setShowAddPlayer(true)}
                className="px-3 py-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Player
              </button>
            </div>

            {players.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <Shield className="h-8 w-8 mx-auto text-slate-600" />
                <p className="text-xs">No cricket athletes in current database roster.</p>
                <button
                  onClick={() => setPlayers(INITIAL_PLAYERS)}
                  className="px-3 py-1 text-xs text-emerald-400 font-bold border border-emerald-500/35 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Load Preloaded Athletes
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {players.map((p) => {
                  const isActive = p.id === selectedPlayerId;
                  const pStats = calculateCareerStats(p.matches);
                  return (
                    <div
                      key={p.id}
                      className={`group p-3 rounded-xl border transition-all flex justify-between items-center ${
                        isActive 
                          ? 'bg-slate-800/90 border-slate-700 border-l-[4px] border-l-emerald-500 shadow-lg' 
                          : 'border-slate-800/80 bg-slate-950/45 hover:bg-slate-800/55 hover:border-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedPlayerId(p.id);
                          setActiveView('dashboard');
                        }}
                        className="flex-1 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {p.imageUrl ? (
                            <img 
                              src={p.imageUrl} 
                              alt={p.name} 
                              referrerPolicy="no-referrer"
                              className="h-9 w-9 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-slate-700 text-sm">
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-100 group-hover:text-emerald-400 transition-colors">{p.name}</h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                              <span>{p.state}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-emerald-400/90 font-bold text-[9px] uppercase tracking-wider">{p.role}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick metrics summary */}
                        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-dashed border-slate-800 text-[10px] font-mono text-slate-400">
                          <div>
                            Avg: <span className="font-bold text-slate-100">{pStats.battingAverage}</span>
                          </div>
                          <div>
                            Wkts: <span className="font-bold text-slate-100">{pStats.totalWickets}</span>
                          </div>
                          <div>
                            Matches: <span className="font-bold text-slate-100">{pStats.totalMatches}</span>
                          </div>
                        </div>
                      </button>

                      {/* Deletion control */}
                      <button
                        onClick={() => handleDeletePlayer(p.id)}
                        className="ml-3 p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 opacity-80 hover:opacity-100 transition-all cursor-pointer"
                        title={`Delete ${p.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick instructions / help panel for slides */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-2xl p-5 shadow-xl space-y-3 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-sans">
              <Presentation className="h-4 w-4" />
              Presentation Tip Sheet
            </h4>
            <p className="text-xs leading-relaxed text-slate-300">
              Need to state match figures in high stakes pitches? Press the <strong>"Enter Presentation Mode"</strong> button above charts. It converts stats into full-screen high-resolution cards perfect for projectors.
            </p>
            <div className="h-[1px] bg-slate-800" />
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
              <Flame className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
              <span>Full local storage recovery is active.</span>
            </div>
          </div>
        </section>

        {/* Column Right: Dashboard or player comparison view */}
        <section className="lg:col-span-8 space-y-6">
          {activeView === 'comparison' ? (
            <PlayerComparison players={players} />
          ) : activePlayer ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Athlete Banner details */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl border border-slate-850 flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  {activePlayer.imageUrl ? (
                    <img 
                      src={activePlayer.imageUrl} 
                      alt={activePlayer.name} 
                      referrerPolicy="no-referrer"
                      className="h-20 w-20 rounded-2xl object-cover border-2 border-slate-700 shadow-inner"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-slate-950 flex items-center justify-center text-emerald-400 border-2 border-slate-800 font-black text-3xl">
                      {activePlayer.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-2xl font-black tracking-tight text-white">{activePlayer.name}</h2>
                      <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase rounded-full">
                        {activePlayer.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1 justify-center sm:justify-start font-medium leading-none">
                      <span>State represented:</span>
                      <strong className="text-white font-bold">{activePlayer.state}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 max-w-md italic font-normal line-clamp-2">
                      {activePlayer.bio || "No biography added yet. Input a short custom summary down in details profile."}
                    </p>
                  </div>
                </div>

                {/* Operations overlay inside banner */}
                <div className="flex flex-col justify-between items-center sm:items-end gap-3 self-center sm:self-auto border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-6">
                  <button
                    onClick={() => setShowAddMatch(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md hover:shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add Match Data
                  </button>

                  <button
                    onClick={() => {
                      if (activePlayer.matches.length === 0) {
                        requestConfirmation(
                          'No Match Records Stored',
                          'Please log at least one match performance record for this player before opening presentation slide boards.',
                          () => {},
                          { confirmText: 'Acknowledge', type: 'warning' }
                        );
                        return;
                      }
                      setShowPresentation(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-900 text-slate-200 rounded-xl text-xs font-bold border border-slate-800 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Presentation className="h-4 w-4 text-emerald-400" />
                    Presentation View
                  </button>
                </div>
              </div>

              {/* Season Filtering Button Bar */}
              {activePlayer && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-800">Filter Performance Season</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Select dynamic years, filter manually, or enter a custom pattern</p>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 justify-center sm:justify-end">
                    {/* Dropdown Box for Season Filter */}
                    <div className="relative">
                      <select
                        id="season-select"
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-[10px] font-black font-mono text-slate-700 uppercase tracking-widest cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-555 transition-all"
                      >
                        <option value="All">All Seasons</option>
                        {availableSeasons.map(season => (
                          <option key={season} value={season}>Season {season}</option>
                        ))}
                        {selectedSeason !== 'All' && !availableSeasons.includes(selectedSeason) && (
                          <option value={selectedSeason}>{selectedSeason} (Custom Entry)</option>
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Optional Custom Manual Year Input Field */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const val = formData.get('manualSeason')?.toString().trim();
                        if (val) {
                          setSelectedSeason(val);
                          e.currentTarget.reset();
                        }
                      }}
                      className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-1.5 py-1 rounded-xl shadow-xs"
                    >
                      <input
                        type="text"
                        name="manualSeason"
                        placeholder="Type Year..."
                        maxLength={12}
                        className="w-16 sm:w-20 bg-transparent text-[10px] font-bold font-mono text-slate-700 placeholder:text-slate-400 focus:outline-none text-center"
                      />
                      <button
                        type="submit"
                        className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black font-mono uppercase cursor-pointer transition-colors"
                      >
                        Set
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Digital Career scorecard counters */}
              {activeStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Cards */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 relative overflow-hidden group hover:shadow-md hover:border-slate-350 transition-all">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Batting Stats
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{activeStats.totalRuns}</span>
                      <span className="text-xs text-slate-400 font-mono">runs</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono font-bold text-slate-500">
                      <div>
                        Avg: <strong className="text-slate-900">{activeStats.battingAverage}</strong>
                      </div>
                      <div>
                        S/R: <strong className="text-slate-900">{activeStats.battingStrikeRate}%</strong>
                      </div>
                    </div>
                    <div className="absolute right-3 top-3 p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Target className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 relative overflow-hidden group hover:shadow-md hover:border-slate-350 transition-all">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      High Scorings
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{activeStats.highestScore}*</span>
                      <span className="text-xs text-slate-400 font-mono">HS</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono font-bold text-slate-500">
                      <div>
                        100s: <strong className="text-slate-900">{activeStats.hundreds}</strong>
                      </div>
                      <div>
                        50s: <strong className="text-slate-900">{activeStats.fifties}</strong>
                      </div>
                    </div>
                    <div className="absolute right-3 top-3 p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Award className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 relative overflow-hidden group hover:shadow-md hover:border-slate-350 transition-all">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Bowling Stats
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{activeStats.totalWickets}</span>
                      <span className="text-xs text-slate-400 font-mono">wickets</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono font-bold text-slate-500">
                      <div>
                        Overs: <strong className="text-slate-900">{activeStats.totalOvers}</strong>
                      </div>
                      <div>
                        Eco: <strong className="text-slate-900">{activeStats.bowlingEconomy}</strong>
                      </div>
                    </div>
                    <div className="absolute right-3 top-3 p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Flame className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 relative overflow-hidden group hover:shadow-md hover:border-slate-350 transition-all">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Best Bowling
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold font-mono text-slate-900">
                        {formatBestBowling(activeStats.bestBowling)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1 mt-3 pt-3 border-t border-slate-100 text-[10px] font-mono font-bold text-slate-500">
                      <div className="text-center">
                        Best spell across formats
                      </div>
                    </div>
                    <div className="absolute right-3 top-3 p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Trophy className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Graphical representation dashboard tabs and tables */}
              <DashboardCharts 
                player={activePlayer} 
                onDeleteMatch={handleDeleteMatch}
                selectedSeason={selectedSeason}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center text-neutral-500">
              <Shield className="h-8 w-8 mx-auto text-neutral-300 mb-2" />
              <p className="text-sm">Please register or import sample cricket athletes on the sidebar list.</p>
            </div>
          )}
        </section>

      </main>

      {/* Floating Modal overlay forms */}
      {showAddPlayer && (
        <PlayerForm
          onAddPlayer={handleAddPlayer}
          onClose={() => setShowAddPlayer(false)}
        />
      )}

      {showAddMatch && activePlayer && (
        <MatchForm
          playerRole={activePlayer.role}
          onAddMatch={handleAddMatch}
          onClose={() => setShowAddMatch(false)}
        />
      )}

      {showPresentation && activePlayer && (
        <PresentationMode
          player={activePlayer}
          selectedSeason={selectedSeason}
          onClose={() => setShowPresentation(false)}
        />
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in animate-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  confirmDialog.type === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <Trash2 className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-800">
                  {confirmDialog.title}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {confirmDialog.message}
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 border border-slate-350 rounded-xl text-slate-700 font-bold hover:bg-slate-200 transition-colors text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className={`px-4 py-2 rounded-xl text-slate-950 font-black transition-colors shadow-md text-xs font-mono uppercase tracking-wider cursor-pointer ${
                  confirmDialog.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-655 text-slate-950'
                }`}
              >
                {confirmDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How to Use Tutorial Modal */}
      {showHowToUse && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in animate-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-250 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-850">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-emerald-450" />
                <h3 className="font-black text-sm uppercase tracking-wider font-sans text-white">How to Use Crex Analytica</h3>
              </div>
              <button 
                onClick={() => setShowHowToUse(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-450 hover:text-white transition-colors cursor-pointer"
                aria-label="Close tutorial"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 overflow-y-auto space-y-5">
              <p className="text-xs text-slate-650 font-medium leading-relaxed">
                Welcome to <strong className="text-slate-850">Crex Analytica</strong>, a professional performance ledger and comparative engine. Follow this quick tutorial to handle client performance presentations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/60 space-y-2">
                  <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded font-mono">
                    Step 1
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Roster Registration</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tap <strong className="text-slate-700">"Add Player"</strong> on the left panel, input the athlete's name, role (Batsman, Bowler, All-Rounder, Wicketkeeper-Batsman), select state, and click "Create".
                  </p>
                </div>

                <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/60 space-y-2">
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase rounded font-mono">
                    Step 2
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Log Match Data</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Select a cricketer, then click <strong className="text-slate-700">"Add Match Data"</strong>. Toggle the batting and bowling options to input runs, balls, wickets, overs, or maidens.
                  </p>
                </div>

                <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/60 space-y-2">
                  <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded font-mono">
                    Step 3
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Dynamic Graphics</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Check the profile metrics! Career runs trace, batting average trends, strike frequency index, and econ spell charts compile instantly using professional graphical charts.
                  </p>
                </div>

                <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/60 space-y-2">
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase rounded font-mono">
                    Step 4
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Athlete Comparisons</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Access the <strong className="text-slate-700">"Dual head-to-head Index"</strong> tab. Choose any two cricketers to overlay average comparative stats side-by-side with interactive gauge indicators.
                  </p>
                </div>
              </div>

              <div className="border border-teal-150 rounded-xl p-4 bg-emerald-50/45 border-l-[4px] border-l-emerald-500 space-y-1.5 animate-pulse-subtle">
                <h4 className="font-black text-xs text-slate-850 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                  <Presentation className="h-4 w-4 text-emerald-600" />
                  Presentation Pitch Deck
                </h4>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Presenting to coaches or talent scouts? Open the <strong className="text-slate-900">"Presentation View"</strong> in any player's card to convert their performance metrics into screen-optimized visual slides!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">
                Local Database active
              </span>
              <button
                onClick={() => setShowHowToUse(false)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider font-mono cursor-pointer transition-colors shadow-md"
              >
                Let's Play
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Humble cosmetic footer */}
      <footer className="bg-slate-950 text-slate-500 py-6 text-center text-xs mt-auto border-t border-slate-900 font-sans">
        <p className="font-mono text-slate-400">© 2026 Crex Analytica Performance Deck</p>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-mono">Structured presentation engine fueled by interactive graphical charts</p>
      </footer>

    </div>
  );
}
