import type { Match, MatchSport } from '@/types';
import { todayISO } from '@/utils/format';

interface League {
  league: string;
  teams: string[];
}

const LEAGUES: Record<MatchSport, League[]> = {
  Football: [
    {
      league: 'Ghana Premier League',
      teams: ['Hearts of Oak', 'Asante Kotoko', 'Medeama SC', 'Accra Lions', 'Aduana Stars', 'Great Olympics'],
    },
    {
      league: 'English Premier League',
      teams: ['Arsenal', 'Liverpool', 'Manchester City', 'Chelsea', 'Manchester United', 'Tottenham'],
    },
    {
      league: 'UEFA Champions League',
      teams: ['Real Madrid', 'Barcelona', 'Bayern Munich', 'PSG', 'Inter Milan', 'Juventus'],
    },
  ],
  Basketball: [
    {
      league: 'NBA',
      teams: ['LA Lakers', 'Boston Celtics', 'Golden State Warriors', 'Milwaukee Bucks', 'Denver Nuggets', 'Miami Heat'],
    },
    {
      league: 'EuroLeague',
      teams: ['Panathinaikos', 'Real Madrid', 'Fenerbahce', 'Barcelona'],
    },
  ],
  Tennis: [
    {
      league: 'ATP Tour',
      teams: ['Novak Djokovic', 'Carlos Alcaraz', 'Jannik Sinner', 'Daniil Medvedev', 'Alexander Zverev', 'Holger Rune'],
    },
  ],
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function pickPair(rand: () => number, teams: string[]): [string, string] {
  const a = Math.floor(rand() * teams.length);
  let b = Math.floor(rand() * (teams.length - 1));
  if (b >= a) b += 1;
  return [teams[a], teams[b]];
}

function twoWayOdds(rand: () => number): [number, number] {
  const home = round2(1.4 + rand() * 1.5);
  const away = round2(Math.max(1.2, 1 / (1 - 1 / home + 0.07)));
  return [home, Math.min(9, away)];
}

export function generateMatches(cycleSeed?: number): Match[] {
  const seed = cycleSeed ?? Number(todayISO().replace(/-/g, ''));
  const rand = mulberry32(seed);
  const matches: Match[] = [];
  let seq = 0;

  const kickoff = (dayOffset: number, baseHour: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(baseHour + Math.floor(rand() * 3), rand() < 0.5 ? 0 : 30, 0, 0);
    return d.toISOString();
  };

  const addFootball = (league: string, teams: string[], dayOffset: number, baseHour: number) => {
    const [home, away] = pickPair(rand, teams);
    matches.push({
      id: `match-${seed}-${seq++}`,
      sport: 'Football',
      league,
      homeTeam: home,
      awayTeam: away,
      kickoff: kickoff(dayOffset, baseHour),
      homeOdds: round2(1.35 + rand() * 2.6),
      drawOdds: round2(3.0 + rand() * 0.9),
      awayOdds: round2(1.35 + rand() * 2.6),
      status: 'upcoming',
      featured: rand() < 0.32,
    });
  };

  const addTwoWay = (
    sport: MatchSport,
    league: string,
    teams: string[],
    dayOffset: number,
    baseHour: number,
  ) => {
    const [home, away] = pickPair(rand, teams);
    const [homeOdds, awayOdds] = twoWayOdds(rand);
    matches.push({
      id: `match-${seed}-${seq++}`,
      sport,
      league,
      homeTeam: home,
      awayTeam: away,
      kickoff: kickoff(dayOffset, baseHour),
      homeOdds,
      drawOdds: null,
      awayOdds,
      status: 'upcoming',
      featured: rand() < 0.32,
    });
  };

  // Today's fixtures
  addFootball(LEAGUES.Football[0].league, LEAGUES.Football[0].teams, 0, 15);
  addFootball(LEAGUES.Football[0].league, LEAGUES.Football[0].teams, 0, 18);
  addFootball(LEAGUES.Football[1].league, LEAGUES.Football[1].teams, 0, 17);
  addFootball(LEAGUES.Football[1].league, LEAGUES.Football[1].teams, 0, 20);
  addTwoWay('Basketball', LEAGUES.Basketball[0].league, LEAGUES.Basketball[0].teams, 0, 19);
  addTwoWay('Basketball', LEAGUES.Basketball[0].league, LEAGUES.Basketball[0].teams, 0, 21);
  addTwoWay('Tennis', LEAGUES.Tennis[0].league, LEAGUES.Tennis[0].teams, 0, 13);

  // Tomorrow
  addFootball(LEAGUES.Football[2].league, LEAGUES.Football[2].teams, 1, 16);
  addFootball(LEAGUES.Football[2].league, LEAGUES.Football[2].teams, 1, 19);
  addFootball(LEAGUES.Football[1].league, LEAGUES.Football[1].teams, 1, 18);
  addTwoWay('Basketball', LEAGUES.Basketball[1].league, LEAGUES.Basketball[1].teams, 1, 18);
  addTwoWay('Basketball', LEAGUES.Basketball[0].league, LEAGUES.Basketball[0].teams, 1, 20);
  addTwoWay('Tennis', LEAGUES.Tennis[0].league, LEAGUES.Tennis[0].teams, 1, 14);

  // Day after
  addFootball(LEAGUES.Football[0].league, LEAGUES.Football[0].teams, 2, 15);
  addTwoWay('Tennis', LEAGUES.Tennis[0].league, LEAGUES.Tennis[0].teams, 2, 12);

  return matches.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
}
