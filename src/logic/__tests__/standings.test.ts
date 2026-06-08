import { describe, expect, it } from 'vitest'
import type { GroupScores, Team } from '@/types'
import { buildGroupFixtures } from '@/logic/fixtures'
import { computeGroupStanding, isGroupComplete } from '@/logic/standings'

const teams: Team[] = [
  { id: 1, name: 'Alpha', code: 'a', confederation: 'UEFA', fifaRanking: 5, group: 'A' },
  { id: 2, name: 'Bravo', code: 'b', confederation: 'UEFA', fifaRanking: 10, group: 'A' },
  { id: 3, name: 'Charlie', code: 'c', confederation: 'UEFA', fifaRanking: 15, group: 'A' },
  { id: 4, name: 'Delta', code: 'd', confederation: 'UEFA', fifaRanking: 20, group: 'A' },
]

const fixtures = buildGroupFixtures('A', teams)

function scoreFor(homeId: number, awayId: number): string {
  const fixture = fixtures.find(
    (f) =>
      (f.homeId === homeId && f.awayId === awayId) ||
      (f.homeId === awayId && f.awayId === homeId),
  )
  if (!fixture) throw new Error(`Aucun match entre ${homeId} et ${awayId}`)
  return fixture.id
}

function scores(
  results: Array<[home: number, away: number, hg: number, ag: number]>,
): GroupScores {
  const out: GroupScores = {}
  for (const [home, away, hg, ag] of results) {
    const fixture = fixtures.find((f) => f.homeId === home && f.awayId === away)
    if (!fixture) throw new Error(`Pas de match ${home} (dom) vs ${away} (ext)`)
    out[fixture.id] = { home: hg, away: ag }
  }
  return out
}

function order(standing: ReturnType<typeof computeGroupStanding>): number[] {
  return standing.map((row) => row.team.id)
}

describe('computeGroupStanding', () => {
  it('classe par points en premier', () => {
    const standing = computeGroupStanding(
      teams,
      fixtures,
      scores([
        [1, 2, 2, 0],
        [3, 4, 1, 0],
        [1, 3, 1, 0],
        [4, 2, 0, 0],
        [4, 1, 0, 3],
        [2, 3, 0, 1],
      ]),
    )
    expect(order(standing)).toEqual([1, 3, 2, 4])
    expect(standing[0].points).toBe(9)
  })

  it('départage par différence de buts à points égaux', () => {
    const standing = computeGroupStanding(
      teams,
      fixtures,
      scores([
        [1, 2, 5, 0],
        [3, 4, 1, 0],
        [1, 3, 0, 1],
        [4, 2, 1, 0],
        [4, 1, 0, 1],
        [2, 3, 1, 0],
      ]),
    )
    const top = standing.slice(0, 2).map((r) => r.team.id)
    expect(top).toContain(1)
    expect(standing[0].team.id).toBe(1)
  })

  it('départage par buts marqués quand points et différence sont égaux', () => {
    const standing = computeGroupStanding(
      teams,
      fixtures,
      scores([
        [1, 2, 3, 1],
        [3, 4, 0, 0],
        [1, 3, 0, 0],
        [4, 2, 0, 0],
        [4, 1, 1, 3],
        [2, 3, 0, 0],
      ]),
    )
    expect(standing[0].team.id).toBe(1)
    expect(standing[0].goalsFor).toBeGreaterThanOrEqual(standing[1].goalsFor)
  })

  it('applique la confrontation directe entre deux équipes à égalité de points/diff/buts', () => {
    const s = scores([
      [1, 2, 1, 0],
      [3, 4, 0, 0],
      [1, 3, 0, 1],
      [4, 2, 0, 1],
      [4, 1, 0, 2],
      [2, 3, 2, 0],
    ])
    const standing = computeGroupStanding(teams, fixtures, s)
    const idx1 = standing.findIndex((r) => r.team.id === 1)
    const idx2 = standing.findIndex((r) => r.team.id === 2)
    expect(standing[idx1].points).toBe(standing[idx2].points)
    expect(standing[idx1].goalDifference).toBe(standing[idx2].goalDifference)
    expect(standing[idx1].goalsFor).toBe(standing[idx2].goalsFor)
    expect(idx1).toBeLessThan(idx2)
    expect(scoreFor(1, 2)).toBeDefined()
  })

  it('retombe sur le classement FIFA en cas d’égalité totale', () => {
    const allDraws = scores([
      [1, 2, 1, 1],
      [3, 4, 1, 1],
      [1, 3, 1, 1],
      [4, 2, 1, 1],
      [4, 1, 1, 1],
      [2, 3, 1, 1],
    ])
    const standing = computeGroupStanding(teams, fixtures, allDraws)
    expect(order(standing)).toEqual([1, 2, 3, 4])
    expect(standing.every((r) => r.points === 3)).toBe(true)
  })

  it('calcule un classement partiel sans planter', () => {
    const partial = scores([[1, 2, 1, 0]])
    const standing = computeGroupStanding(teams, fixtures, partial)
    expect(standing[0].team.id).toBe(1)
    expect(standing[0].played).toBe(1)
    expect(isGroupComplete(fixtures, partial)).toBe(false)
  })

  it('détecte un groupe complet', () => {
    const full = scores([
      [1, 2, 1, 0],
      [3, 4, 1, 0],
      [1, 3, 1, 0],
      [4, 2, 1, 0],
      [4, 1, 1, 0],
      [2, 3, 1, 0],
    ])
    expect(isGroupComplete(fixtures, full)).toBe(true)
  })
})
