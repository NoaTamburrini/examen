import type {
  GroupFixture,
  GroupScores,
  Standing,
  Team,
} from '../types'

interface Tally {
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

function emptyTally(): Tally {
  return {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  }
}

function applyResult(tally: Tally, scored: number, conceded: number): void {
  tally.played += 1
  tally.goalsFor += scored
  tally.goalsAgainst += conceded
  if (scored > conceded) {
    tally.won += 1
    tally.points += 3
  } else if (scored === conceded) {
    tally.drawn += 1
    tally.points += 1
  } else {
    tally.lost += 1
  }
}

function tallyTeams(
  teamIds: number[],
  fixtures: GroupFixture[],
  scores: GroupScores,
  onlyAmong?: Set<number>,
): Map<number, Tally> {
  const tallies = new Map<number, Tally>(
    teamIds.map((id) => [id, emptyTally()]),
  )
  for (const fixture of fixtures) {
    const score = scores[fixture.id]
    if (!score) continue
    if (
      onlyAmong &&
      (!onlyAmong.has(fixture.homeId) || !onlyAmong.has(fixture.awayId))
    ) {
      continue
    }
    const home = tallies.get(fixture.homeId)
    const away = tallies.get(fixture.awayId)
    if (!home || !away) continue
    applyResult(home, score.home, score.away)
    applyResult(away, score.away, score.home)
  }
  return tallies
}

function overallCompare(a: Tally, b: Tally): number {
  if (b.points !== a.points) return b.points - a.points
  const aDiff = a.goalsFor - a.goalsAgainst
  const bDiff = b.goalsFor - b.goalsAgainst
  if (bDiff !== aDiff) return bDiff - aDiff
  return b.goalsFor - a.goalsFor
}

function breakTie(
  tiedIds: number[],
  teamById: Map<number, Team>,
  fixtures: GroupFixture[],
  scores: GroupScores,
): number[] {
  if (tiedIds.length < 2) return tiedIds

  const headToHead = tallyTeams(tiedIds, fixtures, scores, new Set(tiedIds))

  return [...tiedIds].sort((idA, idB) => {
    const h2h = overallCompare(headToHead.get(idA)!, headToHead.get(idB)!)
    if (h2h !== 0) return h2h
    return teamById.get(idA)!.fifaRanking - teamById.get(idB)!.fifaRanking
  })
}

export function computeGroupStanding(
  teams: Team[],
  fixtures: GroupFixture[],
  scores: GroupScores,
): Standing[] {
  const teamById = new Map(teams.map((team) => [team.id, team]))
  const teamIds = teams.map((team) => team.id)
  const tallies = tallyTeams(teamIds, fixtures, scores)

  const ordered = [...teamIds].sort((idA, idB) =>
    overallCompare(tallies.get(idA)!, tallies.get(idB)!),
  )

  const resolved: number[] = []
  let cursor = 0
  while (cursor < ordered.length) {
    let end = cursor + 1
    while (
      end < ordered.length &&
      overallCompare(tallies.get(ordered[cursor])!, tallies.get(ordered[end])!) === 0
    ) {
      end += 1
    }
    const block = ordered.slice(cursor, end)
    resolved.push(...breakTie(block, teamById, fixtures, scores))
    cursor = end
  }

  return resolved.map((id, index) => {
    const tally = tallies.get(id)!
    return {
      team: teamById.get(id)!,
      played: tally.played,
      won: tally.won,
      drawn: tally.drawn,
      lost: tally.lost,
      goalsFor: tally.goalsFor,
      goalsAgainst: tally.goalsAgainst,
      goalDifference: tally.goalsFor - tally.goalsAgainst,
      points: tally.points,
      rank: index + 1,
    }
  })
}

export function isGroupComplete(
  fixtures: GroupFixture[],
  scores: GroupScores,
): boolean {
  return fixtures.every((fixture) => Boolean(scores[fixture.id]))
}
