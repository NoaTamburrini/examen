import type {
  BracketMatch,
  GroupId,
  KnockoutRound,
  KoResults,
  QualifiedTeam,
  Standing,
} from '../types'
import { rankThirdPlaces, selectBestThirds, type ThirdPlaceEntry } from './bestThirds'

export const ROUND_ORDER: KnockoutRound[] = ['R32', 'R16', 'QF', 'SF', 'F']

export const ROUND_LABELS: Record<KnockoutRound, string> = {
  R32: '16èmes de finale',
  R16: '8èmes de finale',
  QF: 'Quarts de finale',
  SF: 'Demi-finales',
  F: 'Finale',
}

const ROUND_SIZE: Record<KnockoutRound, number> = {
  R32: 16,
  R16: 8,
  QF: 4,
  SF: 2,
  F: 1,
}

interface GroupResult {
  group: GroupId
  standing: Standing
}

function compareForSeeding(a: Standing, b: Standing): number {
  if (b.points !== a.points) return b.points - a.points
  if (b.goalDifference !== a.goalDifference) {
    return b.goalDifference - a.goalDifference
  }
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
  return a.team.fifaRanking - b.team.fifaRanking
}

export function collectQualified(
  standings: Record<GroupId, Standing[]>,
  bestThirdCount: number,
): QualifiedTeam[] {
  const winners: GroupResult[] = []
  const runnersUp: GroupResult[] = []
  const thirds: ThirdPlaceEntry[] = []

  for (const group of Object.keys(standings) as GroupId[]) {
    const table = standings[group]
    if (table[0]) winners.push({ group, standing: table[0] })
    if (table[1]) runnersUp.push({ group, standing: table[1] })
    if (table[2]) thirds.push({ group, standing: table[2] })
  }

  winners.sort((a, b) => compareForSeeding(a.standing, b.standing))
  runnersUp.sort((a, b) => compareForSeeding(a.standing, b.standing))

  const qualifiedWinners: QualifiedTeam[] = winners.map((entry) => ({
    team: entry.standing.team,
    group: entry.group,
    position: 1,
  }))
  const qualifiedRunners: QualifiedTeam[] = runnersUp.map((entry) => ({
    team: entry.standing.team,
    group: entry.group,
    position: 2,
  }))
  const qualifiedThirds = selectBestThirds(
    rankThirdPlaces(thirds),
    bestThirdCount,
  )

  return [...qualifiedWinners, ...qualifiedRunners, ...qualifiedThirds]
}

function seedLabel(entry: QualifiedTeam): string {
  if (entry.position === 1) return `1${entry.group}`
  if (entry.position === 2) return `2${entry.group}`
  return `3${entry.group}`
}

export function buildRound32(qualified: QualifiedTeam[]): BracketMatch[] {
  const seeds = qualified
  const matches: BracketMatch[] = []
  for (let slot = 0; slot < ROUND_SIZE.R32; slot += 1) {
    const home = seeds[slot] ?? null
    const away = seeds[seeds.length - 1 - slot] ?? null
    matches.push({
      id: `R32-${slot + 1}`,
      round: 'R32',
      slot,
      homeId: home ? home.team.id : null,
      awayId: away ? away.team.id : null,
      homeSource: home ? seedLabel(home) : '',
      awaySource: away ? seedLabel(away) : '',
      winnerId: null,
      result: null,
    })
  }
  return matches
}

function prevRound(round: KnockoutRound): KnockoutRound {
  return ROUND_ORDER[ROUND_ORDER.indexOf(round) - 1]
}

function emptyRound(round: KnockoutRound): BracketMatch[] {
  const from = ROUND_LABELS[prevRound(round)]
  return Array.from({ length: ROUND_SIZE[round] }, (_, slot) => ({
    id: `${round}-${slot + 1}`,
    round,
    slot,
    homeId: null,
    awayId: null,
    homeSource: `Vainqueur ${from} ${slot * 2 + 1}`,
    awaySource: `Vainqueur ${from} ${slot * 2 + 2}`,
    winnerId: null,
    result: null,
  }))
}

export function buildBracket(
  qualified: QualifiedTeam[],
  results: KoResults,
): Record<KnockoutRound, BracketMatch[]> {
  const bracket = {
    R32: buildRound32(qualified),
    R16: emptyRound('R16'),
    QF: emptyRound('QF'),
    SF: emptyRound('SF'),
    F: emptyRound('F'),
  } as Record<KnockoutRound, BracketMatch[]>

  for (const round of ROUND_ORDER) {
    for (const match of bracket[round]) {
      const stored = results[match.id]
      if (
        stored &&
        match.homeId !== null &&
        match.awayId !== null &&
        (stored.winnerId === match.homeId || stored.winnerId === match.awayId)
      ) {
        match.result = stored
        match.winnerId = stored.winnerId
      }
    }

    if (round === 'F') break
    const next = ROUND_ORDER[ROUND_ORDER.indexOf(round) + 1]
    bracket[round].forEach((match) => {
      const target = bracket[next][Math.floor(match.slot / 2)]
      const side = match.slot % 2 === 0 ? 'home' : 'away'
      if (side === 'home') {
        target.homeId = match.winnerId
      } else {
        target.awayId = match.winnerId
      }
    })
  }

  return bracket
}

export function getChampion(
  bracket: Record<KnockoutRound, BracketMatch[]>,
): number | null {
  return bracket.F[0]?.winnerId ?? null
}
