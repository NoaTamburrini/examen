import type { GroupId, QualifiedTeam, Standing } from '../types'

export interface ThirdPlaceEntry {
  group: GroupId
  standing: Standing
}

export function rankThirdPlaces(
  thirds: ThirdPlaceEntry[],
): ThirdPlaceEntry[] {
  return [...thirds].sort((a, b) => {
    const sa = a.standing
    const sb = b.standing
    if (sb.points !== sa.points) return sb.points - sa.points
    if (sb.goalDifference !== sa.goalDifference) {
      return sb.goalDifference - sa.goalDifference
    }
    if (sb.goalsFor !== sa.goalsFor) return sb.goalsFor - sa.goalsFor
    return sa.team.fifaRanking - sb.team.fifaRanking
  })
}

export function selectBestThirds(
  thirds: ThirdPlaceEntry[],
  count: number,
): QualifiedTeam[] {
  return rankThirdPlaces(thirds)
    .slice(0, count)
    .map((entry) => ({
      team: entry.standing.team,
      group: entry.group,
      position: 3 as const,
    }))
}
