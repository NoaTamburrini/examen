import { describe, expect, it } from 'vitest'
import type { GroupId, QualifiedTeam, Standing, Team } from '@/types'
import { computeStats } from '@/logic/stats'

const team = (id: number, confederation: Team['confederation']): Team => ({
  id,
  name: `T${id}`,
  code: 't',
  confederation,
  fifaRanking: id,
  group: 'A',
})

const standing = (
  t: Team,
  goalsFor: number,
  goalsAgainst: number,
): Standing => ({
  team: t,
  played: 3,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor,
  goalsAgainst,
  goalDifference: goalsFor - goalsAgainst,
  points: 0,
  rank: 1,
})

const a = team(1, 'UEFA')
const b = team(2, 'CAF')
const c = team(3, 'UEFA')

const standings = {
  A: [standing(a, 8, 1), standing(b, 2, 2), standing(c, 1, 6)],
} as unknown as Record<GroupId, Standing[]>

const qualified: QualifiedTeam[] = [
  { team: a, group: 'A', position: 1 },
  { team: b, group: 'A', position: 2 },
  { team: c, group: 'A', position: 3 },
]

const teamById = new Map<number, Team>([
  [1, a],
  [2, b],
  [3, c],
])

describe('computeStats', () => {
  it('identifie la meilleure attaque et la meilleure défense', () => {
    const stats = computeStats(standings, qualified, null, teamById)
    expect(stats.topScoringTeam?.team.id).toBe(1)
    expect(stats.topScoringTeam?.goals).toBe(8)
    expect(stats.bestDefense?.team.id).toBe(1)
    expect(stats.bestDefense?.conceded).toBe(1)
  })

  it('agrège les buts et la moyenne par match', () => {
    const stats = computeStats(standings, qualified, null, teamById)
    expect(stats.totalGoals).toBe(11)
    expect(stats.matchesPlayed).toBe(4.5)
  })

  it('classe les confédérations qualifiées', () => {
    const stats = computeStats(standings, qualified, null, teamById)
    expect(stats.qualifiedByConfederation[0]).toEqual({
      confederation: 'UEFA',
      count: 2,
    })
  })
})
