/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, PlayerRole } from '../types';
import { Plus, X, User } from 'lucide-react';

interface PlayerFormProps {
  onAddPlayer: (player: Omit<Player, 'matches'>) => void;
  onClose: () => void;
}

export default function PlayerForm({ onAddPlayer, onClose }: PlayerFormProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<PlayerRole>('Batsman');
  const [state, setState] = useState('');
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
    });
    onClose();
  };

  const roles: PlayerRole[] = ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper-Batsman'];

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-850">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-400" />
            <h3 className="font-black text-sm uppercase tracking-wider font-sans text-white">Add New Player Profile</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-lg font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="playerName">
              Full Name *
            </label>
            <input
              id="playerName"
              type="text"
              className="w-full px-3 py-2 border border-slate-250 bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-550 transition-shadow"
              placeholder="e.g. Jasprit Bumrah"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="playerRole">
                Role *
              </label>
              <select
                id="playerRole"
                className="w-full px-3 py-2 border border-slate-250 bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-550 transition-shadow"
                value={role}
                onChange={(e) => setRole(e.target.value as PlayerRole)}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="playerState">
                State *
              </label>
              <input
                id="playerState"
                type="text"
                className="w-full px-3 py-2 border border-slate-250 bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-555 transition-shadow"
                placeholder="e.g. Mumbai"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setError('');
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-350 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors text-xs font-mono uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl font-black transition-colors shadow-md text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create Player
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
