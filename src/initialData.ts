import { Player } from './types';

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'player-1',
    name: 'Virat Kohli',
    role: 'Batsman',
    state: 'Delhi',
    bio: 'One of the greatest modern batsmen, known for chasing totals, flawless technique, and high conversion rate.',
    imageUrl: 'https://images.unsplash.com/photo-1540747737956-37872176dd67?w=150&auto=format&fit=crop&q=80',
    matches: [
      {
        id: 'm-1-1',
        date: '2026-04-10',
        opponent: 'England',
        runsScored: 82,
        ballsFaced: 54,
        isOut: false,
        wicketsTaken: 0,
        oversBowled: 0,
        runsConceded: 0,
        catches: 1,
        stumpings: 0
      },
      {
        id: 'm-1-2',
        date: '2026-04-15',
        opponent: 'Australia',
        runsScored: 112,
        ballsFaced: 95,
        isOut: true,
        wicketsTaken: 0,
        oversBowled: 0,
        runsConceded: 0,
        catches: 2,
        stumpings: 0
      },
      {
        id: 'm-1-3',
        date: '2026-04-20',
        opponent: 'Pakistan',
        runsScored: 54,
        ballsFaced: 41,
        isOut: true,
        wicketsTaken: 0,
        oversBowled: 0,
        runsConceded: 0,
        catches: 0,
        stumpings: 0
      },
      {
        id: 'm-1-4',
        date: '2026-05-01',
        opponent: 'South Africa',
        runsScored: 18,
        ballsFaced: 12,
        isOut: true,
        wicketsTaken: 0,
        oversBowled: 0,
        runsConceded: 0,
        catches: 1,
        stumpings: 0
      },
      {
        id: 'm-1-5',
        date: '2026-05-12',
        opponent: 'New Zealand',
        runsScored: 76,
        ballsFaced: 60,
        isOut: false,
        wicketsTaken: 0,
        oversBowled: 0,
        runsConceded: 0,
        catches: 0,
        stumpings: 0
      },
      {
        id: 'm-1-6',
        date: '2026-05-20',
        opponent: 'Sri Lanka',
        runsScored: 45,
        ballsFaced: 33,
        isOut: true,
        wicketsTaken: 0,
        oversBowled: 0,
        runsConceded: 0,
        catches: 3,
        stumpings: 0
      }
    ]
  },
  {
    id: 'player-2',
    name: 'Jasprit Bumrah',
    role: 'Bowler',
    state: 'Gujarat',
    bio: 'Renowned for his unique orthodox action, high speed, deadly yorkers, and unmatched economy in the death overs.',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=150&auto=format&fit=crop&q=80',
    matches: [
      {
        id: 'm-2-1',
        date: '2026-04-10',
        opponent: 'England',
        runsScored: 2,
        ballsFaced: 5,
        isOut: true,
        wicketsTaken: 3,
        oversBowled: 4,
        runsConceded: 18,
        catches: 0,
        stumpings: 0
      },
      {
        id: 'm-2-2',
        date: '2026-04-15',
        opponent: 'Australia',
        runsScored: 0,
        ballsFaced: 1,
        isOut: false,
        wicketsTaken: 4,
        oversBowled: 4.0,
        runsConceded: 24,
        catches: 1,
        stumpings: 0
      },
      {
        id: 'm-2-3',
        date: '2026-04-20',
        opponent: 'Pakistan',
        runsScored: 5,
        ballsFaced: 4,
        isOut: true,
        wicketsTaken: 2,
        oversBowled: 4.0,
        runsConceded: 14,
        catches: 0,
        stumpings: 0
      },
      {
        id: 'm-2-4',
        date: '2026-05-01',
        opponent: 'South Africa',
        runsScored: 12,
        ballsFaced: 10,
        isOut: true,
        wicketsTaken: 1,
        oversBowled: 4.0,
        runsConceded: 28,
        catches: 0,
        stumpings: 0
      },
      {
        id: 'm-2-5',
        date: '2026-05-12',
        opponent: 'New Zealand',
        runsScored: 1,
        ballsFaced: 3,
        isOut: false,
        wicketsTaken: 3,
        oversBowled: 4.0,
        runsConceded: 20,
        catches: 1,
        stumpings: 0
      },
      {
        id: 'm-2-6',
        date: '2026-05-20',
        opponent: 'Sri Lanka',
        runsScored: 0,
        ballsFaced: 0,
        isOut: false,
        wicketsTaken: 2,
        oversBowled: 4.0,
        runsConceded: 15,
        catches: 2,
        stumpings: 0
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
        id: 'm-3-1',
        date: '2026-04-10',
        opponent: 'England',
        runsScored: 45,
        ballsFaced: 24,
        isOut: true,
        wicketsTaken: 1,
        oversBowled: 3.0,
        runsConceded: 22,
        catches: 1,
        stumpings: 0
      },
      {
        id: 'm-3-2',
        date: '2026-04-15',
        opponent: 'Australia',
        runsScored: 31,
        ballsFaced: 18,
        isOut: false,
        wicketsTaken: 2,
        oversBowled: 4.0,
        runsConceded: 32,
        catches: 0,
        stumpings: 0
      },
      {
        id: 'm-3-3',
        date: '2026-04-20',
        opponent: 'Pakistan',
        runsScored: 12,
        ballsFaced: 8,
        isOut: true,
        wicketsTaken: 1,
        oversBowled: 2.0,
        runsConceded: 18,
        catches: 1,
        stumpings: 0
      },
      {
        id: 'm-3-4',
        date: '2026-05-01',
        opponent: 'South Africa',
        runsScored: 52,
        ballsFaced: 30,
        isOut: true,
        wicketsTaken: 0,
        oversBowled: 3.0,
        runsConceded: 25,
        catches: 0,
        stumpings: 0
      },
      {
        id: 'm-3-5',
        date: '2026-05-12',
        opponent: 'New Zealand',
        runsScored: 28,
        ballsFaced: 15,
        isOut: false,
        wicketsTaken: 2,
        oversBowled: 3.0,
        runsConceded: 19,
        catches: 1,
        stumpings: 0
      },
      {
        id: 'm-3-6',
        date: '2026-05-20',
        opponent: 'Sri Lanka',
        runsScored: 15,
        ballsFaced: 10,
        isOut: true,
        wicketsTaken: 1,
        oversBowled: 3.0,
        runsConceded: 21,
        catches: 2,
        stumpings: 0
      }
    ]
  }
];
