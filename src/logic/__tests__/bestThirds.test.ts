import { describe, expect, it } from 'vitest'
import type { GroupId, Standing, Team } from '../types'
import { rankThirdPlaces, selectBestThirds, type ThirdPlaceEntry } from './bestThirds'

function makeEntry(
  group: GroupId,
  points: number,
  goalDifference: number,
  goalsFor: number,
  fifaRanking: number,
): ThirdPlaceEntry {
  const team: Team = {
    id: fifaRanking,
    name: `Team-${group}`,
    code: group.toLowerCase(),
    confederation: 'UEFA',
    fifaRanking,
    group,
  }
  const standing: Standing = {
    team,
    played: 3,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor,
    goalsAgainst: goalsFor - goalDifference,
    goalDifference,
    points,
    rank: 3,
  }
  return { group, standing }
}

const entries: ThirdPlaceEntry[] = [
  makeEntry('A', 6, 4, 6, 12),
  makeEntry('B', 6, 4, 6, 8),
  makeEntry('C', 5, 2, 5, 20),
  makeEntry('D', 4, 1, 4, 3),
  makeEntry('E', 4, 1, 4, 30),
  makeEntry('F', 4, 0, 3, 15),
  makeEntry('G', 3, 0, 2, 5),
  makeEntry('H', 3, -1, 2, 25),
  makeEntry('I', 2, -2, 1, 9),
  makeEntry('J', 2, -3, 1, 40),
  makeEntry('K', 1, -4, 0, 18),
  makeEntry('L', 0, -6, 0, 47),
]

describe('selectBestThirds', () => {
  it('garde exactement les 8 meilleurs troisièmes', () => {
    const qualified = selectBestThirds(entries, 8)
    expect(qualified).toHaveLength(8)
    expect(qualified.every((q) => q.position === 3)).toBe(true)
  })

  it('départage les points égaux par classement FIFA', () => {
    const ranked = rankThirdPlaces(entries)
    expect(ranked[0].group).toBe('B')
    expect(ranked[1].group).toBe('A')
  })

  it('exclut les 4 plus faibles troisièmes', () => {
    const qualifiedGroups = selectBestThirds(entries, 8).map((q) => q.group)
    expect(qualifiedGroups).not.toContain('I')
    expect(qualifiedGroups).not.toContain('J')
    expect(qualifiedGroups).not.toContain('K')
    expect(qualifiedGroups).not.toContain('L')
  })

  it('applique la différence de buts avant les buts marqués', () => {
    const ranked = rankThirdPlaces(entries)
    const idxD = ranked.findIndex((e) => e.group === 'D')
    const idxF = ranked.findIndex((e) => e.group === 'F')
    expect(idxD).toBeLessThan(idxF)
  })

  it('ne dépend pas de l’ordre d’entrée', () => {
    const shuffled = [...entries].reverse()
    const a = selectBestThirds(entries, 8).map((q) => q.group)
    const b = selectBestThirds(shuffled, 8).map((q) => q.group)
    expect(a).toEqual(b)
  })
})
