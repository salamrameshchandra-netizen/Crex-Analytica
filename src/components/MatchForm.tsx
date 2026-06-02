import React, { useState } from 'react';
import { MatchPerformance, PlayerRole } from '../types';

interface MatchFormProps {
  onAddMatch: (match: MatchPerformance) => void;
  onClose: () => void;
  playerRole: PlayerRole;
}

export default function MatchForm({ onAddMatch, onClose, playerRole }: MatchFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [opponent, setOpponent] = useState('');
  
  // Batting stats
  const [runsScored, setRunsScored] = useState('');
  const [ballsFaced, setBallsFaced] = useState('');
  const [isOut, setIsOut] = useState(true);

  // Bowling stats
  const [wicketsTaken, setWicketsTaken] = useState('');
  const [oversBowled, setOversBowled] = useState('');
  const [runsConceded, setRunsConceded] = useState('');

  // Fielding stats
  const [catches, setCatches] = useState('');
  const [stumpings, setStumpings] = useState('');

  const [error, setError] = useState('');

  // Determine defaults based on role
  const isWicketkeeper = playerRole === 'Wicketkeeper-Batsman';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!opponent.trim()) {
      setError('Opponent/Team name is required');
      return;
    }
    if (!date) {
      setError('Match date is required');
      return;
    }

    const oversNum = parseFloat(oversBowled);
    if (oversBowled && !isNaN(oversNum)) {
      const completedOvers = Math.floor(oversNum);
      const ballsFraction = Math.round((oversNum - completedOvers) * 10);
      if (ballsFraction > 5) {
        setError('Overs fractional part cannot exceed .5 (e.g., 3.5 is valid, 3.6 should be 4.0)');
        return;
      }
    }

    const performance: MatchPerformance = {
      id: `match-${Date.now()}`,
      date,
      opponent: opponent.trim(),
    };

    if (runsScored !== '') {
      performance.runsScored = parseInt(runsScored, 10);
      performance.ballsFaced = ballsFaced !== '' ? parseInt(ballsFaced, 10) : 0;
      performance.isOut = isOut;
    }

    if (wicketsTaken !== '' || oversBowled !== '' || runsConceded !== '') {
      performance.wicketsTaken = wicketsTaken !== '' ? parseInt(wicketsTaken, 10) : 0;
      performance.oversBowled = oversBowled !== '' ? parseFloat(oversBowled) : 0;
      performance.runsConceded = runsConceded !== '' ? parseInt(runsConceded, 10) : 0;
    }

    if (catches !== '') performance.catches = parseInt(catches, 10);
    if (stumpings !== '') performance.stumpings = parseInt(stumpings, 10);

    onAddMatch(performance);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
        >
          ✕
        </button>
        
        <h3 className="font-extrabold text-base text-white uppercase tracking-wider mb-4 font-mono">Record Match Performance</h3>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-3 rounded-xl mb-4 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Opponent *</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-500"
                placeholder="e.g. Australia"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Match Date *</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Batting Section */}
          <div className="border border-slate-800 bg-slate-950/20 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 font-mono">Batting Performance</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Runs Scored</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none"
                  placeholder="e.g. 45"
                  value={runsScored}
                  onChange={(e) => setRunsScored(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Balls Faced</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none"
                  placeholder="e.g. 30"
                  value={ballsFaced}
                  onChange={(e) => setBallsFaced(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Status</label>
                <select
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none"
                  value={isOut ? 'out' : 'notout'}
                  onChange={(e) => setIsOut(e.target.value === 'out')}
                >
                  <option value="out">Out</option>
                  <option value="notout">Not Out</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bowling Section */}
          <div className="border border-slate-800 bg-slate-950/20 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 font-mono">Bowling Performance</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Wickets</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none"
                  placeholder="e.g. 2"
                  value={wicketsTaken}
                  onChange={(e) => setWicketsTaken(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Overs Bowled</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none"
                  placeholder="e.g. 4.0"
                  value={oversBowled}
                  onChange={(e) => setOversBowled(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Runs Conceded</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none"
                  placeholder="e.g. 24"
                  value={runsConceded}
                  onChange={(e) => setRunsConceded(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Fielding Section */}
          <div className="border border-slate-800 bg-slate-950/20 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 font-mono">Fielding Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Catches Taken</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none"
                  placeholder="e.g. 1"
                  value={catches}
                  onChange={(e) => setCatches(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Stumpings</label>
                <input
                  type="number"
                  min="0"
                  disabled={!isWicketkeeper}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none disabled:opacity-50"
                  placeholder={isWicketkeeper ? "e.g. 1" : "Only for Wicketkeeper"}
                  value={stumpings}
                  onChange={(e) => setStumpings(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
            >
              Add Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
