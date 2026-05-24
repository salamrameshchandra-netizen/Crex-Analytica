/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player } from './types';

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'player-1',
    name: 'Virat Kohli',
    role: 'Batsman',
    state: 'Delhi',
    bio: 'One of the greatest modern batsmen, known for chasing totals, flawless technique, and high conversion rate.',
    imageUrl: 'https://images.unsplash.com/photo-1540747737956-37872176dd67?w=150&auto=format&fit=crop&q=80', // Cricket ball/stadium representation placeholder
    matches: [
      {
        id: 'm1-1',
        opponent: 'Australia',
        format: 'ODI',
        date: '2026-04-10',
        runsScored: 82,
        didNotBat: false,
        ballsFaced: 78,
        isOut: true,
        didNotBowl: true,
        oversBowled: 0,
        runsConceded: 0,
        wicketsTaken: 0,
        battingNotes: 'Classic anchor innings. Beautiful wristwork and cover drives.'
      },
      {
        id: 'm1-2',
        opponent: 'England',
        format: 'T20',
        date: '2026-04-15',
        runsScored: 49,
        didNotBat: false,
        ballsFaced: 32,
        isOut: false,
        didNotBowl: true,
        oversBowled: 0,
        runsConceded: 0,
        wicketsTaken: 0,
        battingNotes: 'Accelerated in the death overs. Remained unbeaten.'
      },
      {
        id: 'm1-3',
        opponent: 'Pakistan',
        format: 'ODI',
        date: '2026-04-20',
        runsScored: 114,
        didNotBat: false,
        ballsFaced: 104,
        isOut: true,
        didNotBowl: true,
        oversBowled: 0,
        runsConceded: 0,
        wicketsTaken: 0,
        battingNotes: 'Magnificent century under immense pressure. Standard match-winning knock.'
      },
      {
        id: 'm1-4',
        opponent: 'South Africa',
        format: 'Test',
        date: '2026-05-01',
        runsScored: 76,
        didNotBat: false,
        ballsFaced: 142,
        isOut: true,
        didNotBowl: true,
        oversBowled: 0,
        runsConceded: 0,
        wicketsTaken: 0,
        battingNotes: 'Disciplined display against some high-quality swing and bounce.'
      },
      {
        id: 'm1-5',
        opponent: 'New Zealand',
        format: 'ODI',
        date: '2026-05-12',
        runsScored: 18,
        didNotBat: false,
        ballsFaced: 24,
        isOut: true,
        didNotBowl: true,
        oversBowled: 0,
        runsConceded: 0,
        wicketsTaken: 0,
        battingNotes: 'Caught at slip trying to force a drive on a soft pitch.'
      },
      {
        id: 'm1-6',
        opponent: 'Australia',
        format: 'T20',
        date: '2026-05-20',
        runsScored: 64,
        didNotBat: false,
        ballsFaced: 40,
        isOut: true,
        didNotBowl: true,
        oversBowled: 0,
        runsConceded: 0,
        wicketsTaken: 0,
        battingNotes: 'Aggressive opening, hitting 5 boundaries and 2 sixes.'
      }
    ]
  },
  {
    id: 'player-2',
    name: 'Jasprit Bumrah',
    role: 'Bowler',
    state: 'Gujarat',
    bio: 'Renowned for his unique orthodox action, high speed, deadly yorkers, and unmatched economy in the death overs.',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=150&auto=format&fit=crop&q=80', // Sports player/stadium placeholder
    matches: [
      {
        id: 'm2-1',
        opponent: 'Australia',
        format: 'ODI',
        date: '2026-04-10',
        runsScored: 4,
        didNotBat: false,
        ballsFaced: 8,
        isOut: true,
        didNotBowl: false,
        oversBowled: 10,
        runsConceded: 35,
        wicketsTaken: 3,
        battingNotes: 'Tail-end support.'
      },
      {
        id: 'm2-2',
        opponent: 'England',
        format: 'T20',
        date: '2026-04-15',
        runsScored: 0,
        didNotBat: true,
        ballsFaced: 0,
        isOut: false,
        didNotBowl: false,
        oversBowled: 4,
        runsConceded: 18,
        wicketsTaken: 2,
        maidens: 1
      },
      {
        id: 'm2-3',
        opponent: 'Pakistan',
        format: 'ODI',
        date: '2026-04-20',
        runsScored: 0,
        didNotBat: true,
        ballsFaced: 0,
        isOut: false,
        didNotBowl: false,
        oversBowled: 8.4,
        runsConceded: 42,
        wicketsTaken: 4,
        battingNotes: ''
      },
      {
        id: 'm2-4',
        opponent: 'South Africa',
        format: 'Test',
        date: '2026-05-01',
        runsScored: 12,
        didNotBat: false,
        ballsFaced: 34,
        isOut: true,
        didNotBowl: false,
        oversBowled: 22,
        runsConceded: 58,
        wicketsTaken: 5,
        maidens: 4
      },
      {
        id: 'm2-5',
        opponent: 'New Zealand',
        format: 'ODI',
        date: '2026-05-12',
        runsScored: 2,
        didNotBat: false,
        ballsFaced: 5,
        isOut: false,
        didNotBowl: false,
        oversBowled: 10,
        runsConceded: 47,
        wicketsTaken: 1
      },
      {
        id: 'm2-6',
        opponent: 'Australia',
        format: 'T20',
        date: '2026-05-20',
        runsScored: 0,
        didNotBat: true,
        ballsFaced: 0,
        isOut: false,
        didNotBowl: false,
        oversBowled: 4,
        runsConceded: 24,
        wicketsTaken: 2
      }
    ]
  },
  {
    id: 'player-3',
    name: 'Hardik Pandya',
    role: 'All-Rounder',
    state: 'Baroda',
    bio: 'Dynamic explosive all-rounder capable of destructive batting down the order and bowling crucial medium-fast spell overs.',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=80',
    matches: [
      {
        id: 'm3-1',
        opponent: 'Australia',
        format: 'ODI',
        date: '2026-04-10',
        runsScored: 42,
        didNotBat: false,
        ballsFaced: 28,
        isOut: true,
        didNotBowl: false,
        oversBowled: 6,
        runsConceded: 38,
        wicketsTaken: 1,
        battingNotes: 'Quickfire runs to finish the innings.'
      },
      {
        id: 'm3-2',
        opponent: 'England',
        format: 'T20',
        date: '2026-04-15',
        runsScored: 31,
        didNotBat: false,
        ballsFaced: 16,
        isOut: false,
        didNotBowl: false,
        oversBowled: 3,
        runsConceded: 25,
        wicketsTaken: 1,
        battingNotes: 'Finished beautifully with two massive physical sixes.'
      },
      {
        id: 'm3-3',
        opponent: 'Pakistan',
        format: 'ODI',
        date: '2026-04-20',
        runsScored: 56,
        didNotBat: false,
        ballsFaced: 44,
        isOut: true,
        didNotBowl: false,
        oversBowled: 7,
        runsConceded: 45,
        wicketsTaken: 2,
        battingNotes: 'Solid half-century and picked up key breakthrough wickets.'
      },
      {
        id: 'm3-4',
        opponent: 'South Africa',
        format: 'Test',
        date: '2026-05-01',
        runsScored: 24,
        didNotBat: false,
        ballsFaced: 45,
        isOut: true,
        didNotBowl: false,
        oversBowled: 12,
        runsConceded: 34,
        wicketsTaken: 1
      },
      {
        id: 'm3-5',
        opponent: 'New Zealand',
        format: 'ODI',
        date: '2026-05-12',
        runsScored: 8,
        didNotBat: false,
        ballsFaced: 12,
        isOut: true,
        didNotBowl: false,
        oversBowled: 5,
        runsConceded: 29,
        wicketsTaken: 0
      },
      {
        id: 'm3-6',
        opponent: 'Australia',
        format: 'T20',
        date: '2026-05-20',
        runsScored: 15,
        didNotBat: false,
        ballsFaced: 8,
        isOut: false,
        didNotBowl: false,
        oversBowled: 4,
        runsConceded: 32,
        wicketsTaken: 2
      }
    ]
  }
];
