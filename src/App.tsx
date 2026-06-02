import { useState, useEffect } from 'react';
import { Player, MatchPerformance, PlayerRole } from './types';
import { INITIAL_PLAYERS } from './initialData';
import { getSeasonFromDate } from './utils';

// Import sub components
import PlayerForm from './components/PlayerForm';
import MatchForm from './components/MatchForm';
import PlayerComparison from './components/PlayerComparison';
import PresentationMode from './components/PresentationMode';
import DashboardCharts from './components/DashboardCharts';

// Lucide icon assets
import { 
  Plus, Trash2, Users, BarChart3, ChevronDown, 
  Calendar, Play, Sparkles
} from 'lucide-react';

export default function App() {
  // Sync state with local storage or seed initial players
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('cricket_performance_players');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved players state', e);
      }
    }
    return INITIAL_PLAYERS;
  });

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(() => {
    return players[0]?.id || '';
  });

  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  
  // Controlling modals state
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);

  // Safe UI confirmations State (bypassing native confirm/alert in sandboxed environments)
  const [playerToDeleteId, setPlayerToDeleteId] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('cricket_performance_players', JSON.stringify(players));
  }, [players]);

  // Read active athlete
  const activePlayer = players.find(p => p.id === selectedPlayerId) || players[0];

  // Dynamically calculate unique seasons represented by the active player's matches
  // represented in standard format (e.g., '2026-27') using getSeasonFromDate
  const availableSeasons: string[] = activePlayer
    ? Array.from(new Set(activePlayer.matches.map(m => getSeasonFromDate(m.date))))
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a))
    : [];

  // Register added players
  const handleAddPlayer = (newPlayerInfo: { id: string; name: string; role: PlayerRole; state: string; bio: string }) => {
    const freshPlayer: Player = {
      ...newPlayerInfo,
      matches: [],
      imageUrl: 'https://images.unsplash.com/photo-1540747737956-37872176dd67?w=150&auto=format&fit=crop&q=80'
    };
    setPlayers(prev => [freshPlayer, ...prev]);
    setSelectedPlayerId(freshPlayer.id);
    setSelectedSeason('All');
  };

  // Register added matches
  const handleAddMatch = (newMatch: MatchPerformance) => {
    if (!activePlayer) return;
    setPlayers(prev => prev.map(p => {
      if (p.id === activePlayer.id) {
        return {
          ...p,
          matches: [newMatch, ...p.matches]
        };
      }
      return p;
    }));
  };

  // Handle deleting match representation
  const handleDeleteMatch = (matchId: string) => {
    if (!activePlayer) return;
    setPlayers(prev => prev.map(p => {
      if (p.id === activePlayer.id) {
        return {
          ...p,
          matches: p.matches.filter(m => m.id !== matchId)
        };
      }
      return p;
    }));
  };

  // Handle deleting entire player profile
  const handleDeletePlayer = (playerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (players.length <= 1) {
      setDeleteErrorMessage('Roster must contain at least one default athlete representing data.');
      return;
    }
    setPlayerToDeleteId(playerId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Top Professional App Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/10">
              <BarChart3 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-black font-mono tracking-tight uppercase">Cricket Athledex</h1>
              <span className="text-[10px] text-slate-500 font-mono font-bold leading-none">PERFORMANCE & CAREER LEDGER</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComparison(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-bold leading-none flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Benchmark Comp</span>
            </button>
            <button
              onClick={() => setShowPresentation(true)}
              className="px-3.5 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl text-xs font-black uppercase tracking-wider leading-none flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/5 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Pitch Mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Full-Stack Layout Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left column: Roster of players */}
        <section className="col-span-1 md:col-span-4 lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800/85 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-black font-mono text-slate-400 uppercase tracking-widest">Active Roster</h3>
              <button
                onClick={() => setShowPlayerForm(true)}
                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/15 rounded-lg text-emerald-400 transition-colors cursor-pointer"
                title="Add Player"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* List scroll panel */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {players.map((p) => {
                const isActive = p.id === selectedPlayerId;
                const matchesCount = p.matches.length;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPlayerId(p.id);
                      setSelectedSeason('All');
                    }}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                      isActive 
                        ? 'bg-slate-800 border-emerald-500/55 shadow-md shadow-emerald-500/5' 
                        : 'bg-slate-950/40 border-slate-850 hover:bg-slate-850/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-slate-200 group-hover:text-emerald-400 transition-colors truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">
                        {p.role} • <span className="text-slate-500 font-bold">{p.state}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-md font-mono font-black text-slate-500 group-hover:text-amber-500 transition-colors">
                        {matchesCount}G
                      </span>
                      <button
                        onClick={(e) => handleDeletePlayer(p.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 bg-red-500/10 hover:bg-red-500/25 border border-red-500/10 text-red-400 rounded-md transition-all cursor-pointer"
                        title="Delete athlete profile"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick stats brief or tips widget */}
          <div className="bg-slate-900 border border-slate-800/85 rounded-3xl p-4 text-xs">
            <div className="flex items-center gap-1.5 text-amber-500 font-bold mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-black font-mono uppercase tracking-wider text-[10px]">Roster Intel</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Add a new athlete, click record performance to add individual matches, and filter by dynamic seasons instantly.
            </p>
          </div>
        </section>

        {/* Right column: Main Athlete Performance Ledger & Visual Charts */}
        <section className="col-span-1 md:col-span-8 lg:col-span-9 space-y-6">
          
          {/* Active Athlete profile banner panel */}
          {activePlayer && (
            <div className="bg-slate-900 border border-slate-850/90 rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5">
              
              <div className="flex items-center gap-4 text-center sm:text-left flex-1 min-w-0">
                {activePlayer.imageUrl ? (
                  <img 
                    src={activePlayer.imageUrl} 
                    alt={activePlayer.name} 
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover rounded-2xl border border-slate-750/80"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center font-mono font-black text-2xl text-slate-500 border border-slate-755 border-slate-700">
                    CR
                  </div>
                )}
                <div className="min-w-0">
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-450 text-[9px] font-black tracking-widest uppercase rounded-full border border-emerald-500/20 font-mono inline-block mb-1.5">
                    {activePlayer.role}
                  </span>
                  <h2 className="text-xl font-black text-white leading-none tracking-tight truncate">{activePlayer.name}</h2>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium flex items-center justify-center sm:justify-start gap-1">
                    <span>Origin representative:</span>
                    <strong className="text-slate-200 font-bold">{activePlayer.state}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 italic max-w-lg line-clamp-1">
                    {activePlayer.bio || 'Representing professional rosters and performance tiers.'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                <button
                  onClick={() => setShowMatchForm(true)}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Record Performance</span>
                </button>
              </div>
            </div>
          )}

          {/* Season Filter Bar with Dropdown Select + Manual Input Box */}
          {activePlayer && (
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-950/65 text-emerald-400 border border-slate-850 rounded-xl">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Filter Performance Season</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Select dynamic years or type custom range (e.g. 2026-27)</p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto justify-end">
                {/* Dropdown Select representing Season Selector */}
                <div className="relative w-full sm:w-44">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold font-mono text-slate-200 uppercase tracking-wider cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                  >
                    <option value="All">All Seasons</option>
                    {availableSeasons.map((season) => (
                      <option key={season} value={season}>Season {season}</option>
                    ))}
                    {selectedSeason !== 'All' && !availableSeasons.includes(selectedSeason) && (
                      <option value={selectedSeason}>{selectedSeason} (Custom Filter)</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>

                {/* Custom Manual Season Entry Input Form */}
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
                  className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 shadow-sm gap-1 w-full sm:w-auto"
                >
                  <input
                    type="text"
                    name="manualSeason"
                    placeholder="e.g. 2026-27"
                    maxLength={15}
                    className="px-2.5 py-1 text-xs font-bold font-mono text-slate-200 placeholder:text-slate-600 bg-transparent focus:outline-none w-24 text-center sm:text-left"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-black font-mono uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Active Player Charts & Table of Matches */}
          {activePlayer && (
            <DashboardCharts
              player={activePlayer}
              selectedSeason={selectedSeason}
              onDeleteMatch={handleDeleteMatch}
            />
          )}

        </section>
      </main>

      {/* MODALS RENDER LIST */}
      
      {/* 1. Add Player Modal */}
      {showPlayerForm && (
        <PlayerForm
          onAddPlayer={handleAddPlayer}
          onClose={() => setShowPlayerForm(false)}
        />
      )}

      {/* 2. Record Match Performance Modal */}
      {showMatchForm && activePlayer && (
        <MatchForm
          playerRole={activePlayer.role}
          onAddMatch={handleAddMatch}
          onClose={() => setShowMatchForm(false)}
        />
      )}

      {/* 3. Side-by-Side Comparison Modal */}
      {showComparison && (
        <PlayerComparison
          players={players}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* 4. Fullslide presentation mode */}
      {showPresentation && activePlayer && (
        <PresentationMode
          player={activePlayer}
          selectedSeason={selectedSeason}
          onClose={() => setShowPresentation(false)}
        />
      )}

      {/* Safe Player Deletion Modal */}
      {playerToDeleteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-mono uppercase text-slate-200">Confirm Deletion</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to delete <span className="text-slate-100 font-bold">"{players.find(p => p.id === playerToDeleteId)?.name}"</span> forever?
                All match histories and charts will be lost.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPlayerToDeleteId(null)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-bold leading-none cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const remaining = players.filter(p => p.id !== playerToDeleteId);
                  setPlayers(remaining);
                  if (selectedPlayerId === playerToDeleteId) {
                    setSelectedPlayerId(remaining[0].id);
                  }
                  setPlayerToDeleteId(null);
                }}
                className="flex-1 py-1.5 bg-red-500 hover:bg-red-400 text-slate-950 font-black uppercase tracking-wider rounded-xl text-xs leading-none cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Limit/Error Alert Modal */}
      {deleteErrorMessage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-mono uppercase text-slate-200">Roster Safe Limit</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {deleteErrorMessage}
              </p>
            </div>
            <button
              onClick={() => setDeleteErrorMessage(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-bold leading-none cursor-pointer transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Aesthetic minimalistic footer */}
      <footer className="py-6 px-6 bg-slate-950 text-center border-t border-slate-900 mt-12 text-[10px] text-slate-600 font-mono tracking-widest uppercase">
        © {new Date().getFullYear()} Athledex Cricket Laboratories • Local Sandbox Persistence Enabled
      </footer>
    </div>
  );
}
