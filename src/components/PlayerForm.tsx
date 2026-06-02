import React, { useState } from 'react';
import { PlayerRole } from '../types';

interface PlayerFormProps {
  onAddPlayer: (player: { id: string; name: string; role: PlayerRole; state: string; bio: string }) => void;
  onClose: () => void;
}

export default function PlayerForm({ onAddPlayer, onClose }: PlayerFormProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<PlayerRole>('Batsman');
  const [state, setState] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Player name is required');
      return;
    }
    if (!state.trim()) {
      setError('State is required');
      return;
    }

    onAddPlayer({
      id: `player-${Date.now()}`,
      name: name.trim(),
      role,
      state: state.trim(),
      bio: bio.trim() || 'Professional athlete representation.',
    });
    onClose();
  };

  const roles: PlayerRole[] = ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper-Batsman'];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
        >
          ✕
        </button>
        <h3 className="font-extrabold text-base text-white uppercase tracking-wider mb-4 font-mono">Create Athlete Profile</h3>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-3 rounded-xl mb-4 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Player Name *</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-500"
              placeholder="e.g. MS Dhoni"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Role *</label>
            <select
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={role}
              onChange={(e) => setRole(e.target.value as PlayerRole)}
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">State *</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-500"
              placeholder="e.g. Jharkhand"
              value={state}
              onChange={(e) => { setState(e.target.value); setError(''); }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Short Biography</label>
            <textarea
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-500 h-20 resize-none"
              placeholder="Brief professional history or profile..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
