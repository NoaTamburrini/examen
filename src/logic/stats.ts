import type {
  BracketMatch,
  Confederation,
  GroupId,
  KnockoutRound,
  QualifiedTeam,
  Standing,
  Team,
} from '@/types'

export interface ConfederationCount {
  confederation: Confederation
  count: number
}

export interface TournamentStats {
  totalGoals: number
  matchesPlayed: number
  averageGoals: number
  topScoringTeam: { team: Team; goals: number } | null
  bestDefense: { team: Team; conceded: number } | null
  qualifiedByConfederation: ConfederationCount[]
  finalists: Team[]
  champion: Team | null
}

export const computeStats = (
  standings: Record<GroupId, Standing[]>,
  qualified: QualifiedTeam[],
  rounds: Record<KnockoutRound, BracketMatch[]> | null,
  teamById: Map<number, Team>,
): TournamentStats => {
  const allRows = Object.values(standings).flat()

  let totalGoals = 0
  let matchesPlayed = 0
  for (const row of allRows) {
    totalGoals += row.goalsFor
    matchesPlayed += row.played
  }
  matchesPlayed = matchesPlayed / 2

  const topScoringTeam = allRows.reduce<{ team: Team; goals: number } | null>(
    (best, row) => {
      if (row.played === 0) return best
      if (!best || row.goalsFor > best.goals) {
        return { team: row.team, goals: row.goalsFor }
      }
      return best
    },
    null,
  )

  const bestDefense = allRows.reduce<{ team: Team; conceded: number } | null>(
    (best, row) => {
      if (row.played === 0) return best
      if (!best || row.goalsAgainst < best.conceded) {
        return { team: row.team, conceded: row.goalsAgainst }
      }
      return best
    },
    null,
  )

  const confederationMap = new Map<Confederation, number>()
  for (const entry of qualified) {
    confederationMap.set(
      entry.team.confederation,
      (confederationMap.get(entry.team.confederation) ?? 0) + 1,
    )
  }
  const qualifiedByConfederation: ConfederationCount[] = [
    ...confederationMap.entries(),
  ]
    .map(([confederation, count]) => ({ confederation, count }))
    .sort((a, b) => b.count - a.count)

  let finalists: Team[] = []
  let champion: Team | null = null
  if (rounds) {
    const final = rounds.F[0]
    finalists = [final.homeId, final.awayId]
      .filter((id): id is number => id !== null)
      .map(id => teamById.get(id)!)
    champion = final.winnerId !== null ? teamById.get(final.winnerId)! : null
  }

  return {
    totalGoals,
    matchesPlayed,
    averageGoals: matchesPlayed > 0 ? totalGoals / matchesPlayed : 0,
    topScoringTeam,
    bestDefense,
    qualifiedByConfederation,
    finalists,
    champion,
  }
}
