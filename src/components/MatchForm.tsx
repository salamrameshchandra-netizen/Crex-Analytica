/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MatchPerformance, PlayerRole } from '../types';
import { Plus, X, Award, Eye } from 'lucide-react';

interface MatchFormProps {
  playerRole: PlayerRole;
  onAddMatch: (match: MatchPerformance) => void;
  onClose: () => void;
}

export default function MatchForm({ playerRole, onAddMatch, onClose }: MatchFormProps) {
  const [opponent, setOpponent] = useState('');
  const [format, setFormat] = useState<'T20' | 'ODI' | 'Test'>('T20');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Batting
  const [didNotBat, setDidNotBat] = useState(playerRole === 'Bowler');
  const [runsScored, setRunsScored] = useState(0);
  const [ballsFaced, setBallsFaced] = useState(0);
  const [isOut, setIsOut] = useState(true);
  const [battingNotes, setBattingNotes] = useState('');

  // Bowling
  const [didNotBowl, setDidNotBowl] = useState(playerRole === 'Batsman');
  const [oversBowledStr, setOversBowledStr] = useState('0'); // custom input so user can type 3.4
  const [runsConceded, setRunsConceded] = useState(0);
  const [wicketsTaken, setWicketsTaken] = useState(0);
  const [maidens, setMaidens] = useState(0);

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent.trim()) {
      setError('Opponent name is required');
      return;
    }
    if (!date) {
      setError('Match date is required');
      return;
    }

    let pOvers = 0;
    if (!didNotBowl) {
      pOvers = parseFloat(oversBowledStr) || 0;
      // Validate fractional overs: e.g. 3.6 is invalid as it should be 4.0 or 3.0-3.5
      const fractionalPart = Number((pOvers % 1).toFixed(1));
      if (fractionalPart > 0.5) {
        setError('Overs cannot have more than 5 balls. Use .1 to .5 (e.g. 3.4 is 3 overs and 4 balls).');
        return;
      }
    }

    onAddMatch({
      id: `match-${Date.now()}`,
      opponent: opponent.trim(),
      format,
      date,
      didNotBat,
      runsScored: didNotBat ? 0 : runsScored,
      ballsFaced: didNotBat ? 0 : ballsFaced,
      isOut: didNotBat ? false : isOut,
      battingNotes: battingNotes.trim() || undefined,
      didNotBowl,
      oversBowled: didNotBowl ? 0 : pOvers,
      runsConceded: didNotBowl ? 0 : runsConceded,
      wicketsTaken: didNotBowl ? 0 : wicketsTaken,
      maidens: didNotBowl ? 0 : maidens,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl border border-slate-205 shadow-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-850">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-450" />
            <h3 className="font-black text-sm uppercase tracking-wider font-sans text-white">Add Match Performance Data</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-450 hover:text-white transition-colors cursor-pointer"
            aria-label="Close match form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-750 text-xs font-bold rounded-lg font-mono">
              {error}
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="matchFormat">
                Format
              </label>
              <select
                id="matchFormat"
                className="w-full px-3 py-1.5 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
              >
                <option value="T20">T20 Match</option>
                <option value="ODI">ODI Match</option>
                <option value="Test">Test Match</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="mOpponent">
                Opponent *
              </label>
              <input
                id="mOpponent"
                type="text"
                placeholder="e.g. Australia"
                className="w-full px-3 py-1.5 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                value={opponent}
                onChange={(e) => {
                  setOpponent(e.target.value);
                  setError('');
                }}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="mDate">
                Date *
              </label>
              <input
                id="mDate"
                type="date"
                className="w-full px-3 py-1.5 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Batting Stats Section */}
          <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                🏏 Batting Performance
              </h4>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase tracking-wider font-mono text-slate-500">
                <input
                  type="checkbox"
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-350 h-3.5 w-3.5"
                  checked={didNotBat}
                  onChange={(e) => setDidNotBat(e.target.checked)}
                />
                Did not bat
              </label>
            </div>

            {!didNotBat && (
              <div className="grid grid-cols-3 gap-3 animate-in slide-in-from-top-1 duration-150">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="runsS">
                    Runs Scored
                  </label>
                  <input
                    id="runsS"
                    type="number"
                    min="0"
                    className="w-full px-3 py-1.5 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-slate-800"
                    value={runsScored}
                    onChange={(e) => setRunsScored(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="ballsF">
                    Balls Faced
                  </label>
                  <input
                    id="ballsF"
                    type="number"
                    min="0"
                    className="w-full px-3 py-1.5 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-slate-800"
                    value={ballsFaced}
                    onChange={(e) => setBallsFaced(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-2">Dismissal Status</label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                      <input
                        type="radio"
                        name="out"
                        className="text-emerald-600 focus:ring-emerald-555"
                        checked={isOut}
                        onChange={() => setIsOut(true)}
                      />
                      Out
                    </label>
                    <label className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                      <input
                        type="radio"
                        name="out"
                        className="text-emerald-600 focus:ring-emerald-555"
                        checked={!isOut}
                        onChange={() => setIsOut(false)}
                      />
                      Not Out
                    </label>
                  </div>
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="bNotes">
                    Batting Summary Notes
                  </label>
                  <input
                    id="bNotes"
                    type="text"
                    placeholder="e.g. Elegant drives, solid anchor"
                    className="w-full px-3 py-1.5 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-slate-800"
                    value={battingNotes}
                    onChange={(e) => setBattingNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bowling Stats Section */}
          <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                🥎 Bowling Performance
              </h4>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase tracking-wider font-mono text-slate-500">
                <input
                  type="checkbox"
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-350 h-3.5 w-3.5"
                  checked={didNotBowl}
                  onChange={(e) => setDidNotBowl(e.target.checked)}
                />
                Did not bowl
              </label>
            </div>

            {!didNotBowl && (
              <div className="grid grid-cols-4 gap-2.5 animate-in slide-in-from-top-1 duration-150">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="oversBo">
                    Overs
                  </label>
                  <input
                    id="oversBo"
                    type="text"
                    placeholder="e.g. 4.0 or 3.4"
                    className="w-full px-2.5 py-1.5 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-center font-mono text-slate-800"
                    value={oversBowledStr}
                    onChange={(e) => {
                      setOversBowledStr(e.target.value);
                      setError('');
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="rConceded">
                    Runs
                  </label>
                  <input
                    id="rConceded"
                    type="number"
                    min="0"
                    className="w-full px-2 py-1.5 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-center text-slate-800"
                    value={runsConceded}
                    onChange={(e) => setRunsConceded(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="wTaken">
                    Wickets
                  </label>
                  <input
                    id="wTaken"
                    type="number"
                    min="0"
                    className="w-full px-2 py-1.5 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-center text-slate-800"
                    value={wicketsTaken}
                    onChange={(e) => setWicketsTaken(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-1" htmlFor="mOvers">
                    Maidens
                  </label>
                  <input
                    id="mOvers"
                    type="number"
                    min="0"
                    className="w-full px-2 py-1.5 border border-slate-250 bg-slate-50 rounded-lg text-xs font-bold text-center text-slate-800"
                    value={maidens}
                    onChange={(e) => setMaidens(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
              </div>
            )}
            {!didNotBowl && (
              <p className="text-[10px] font-mono text-slate-400">
                * Note on Overs: Enter completed overs and balls. E.g., <strong>3.4</strong> represents 3 overs and 4 balls.
              </p>
            )}
          </div>

          {/* Submission buttons */}
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
              Save Performance
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
