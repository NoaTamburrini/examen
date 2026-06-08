import { describe, expect, it } from 'vitest'
import type { KoResults, QualifiedTeam, Team } from '@/types'
import { buildBracket, buildRound32, getChampion } from '@/logic/bracket'

function fakeTeam(id: number): Team {
  return {
    id,
    name: `T${id}`,
    code: 't',
    confederation: 'UEFA',
    fifaRanking: id,
    group: 'A',
  }
}

const qualified: QualifiedTeam[] = Array.from({ length: 32 }, (_, i) => ({
  team: fakeTeam(i + 1),
  group: 'A',
  position: 1,
}))

describe('buildRound32', () => {
  it('produit 16 matchs', () => {
    expect(buildRound32(qualified)).toHaveLength(16)
  })

  it('apparie le meilleur seed au plus faible (1 vs 32)', () => {
    const matches = buildRound32(qualified)
    expect(matches[0].homeId).toBe(1)
    expect(matches[0].awayId).toBe(32)
    expect(matches[15].homeId).toBe(16)
    expect(matches[15].awayId).toBe(17)
  })
})

describe('buildBracket propagation', () => {
  it('laisse les tours suivants vides sans résultats', () => {
    const bracket = buildBracket(qualified, {})
    expect(bracket.R16.every((m) => m.homeId === null && m.awayId === null)).toBe(true)
    expect(getChampion(bracket)).toBeNull()
  })

  it('propage les vainqueurs jusqu’à la finale', () => {
    const results: KoResults = {}
    const r32 = buildRound32(qualified)
    for (const match of r32) {
      results[match.id] = { winnerId: match.homeId!, score: { home: 1, away: 0 } }
    }

    let bracket = buildBracket(qualified, results)
    for (const round of ['R16', 'QF', 'SF', 'F'] as const) {
      for (const match of bracket[round]) {
        if (match.homeId !== null) {
          results[match.id] = { winnerId: match.homeId, score: { home: 1, away: 0 } }
        }
      }
      bracket = buildBracket(qualified, results)
    }

    expect(bracket.R16[0].homeId).toBe(1)
    expect(bracket.F[0].homeId).toBe(1)
    expect(getChampion(bracket)).toBe(1)
  })

  it('ignore un résultat dont le vainqueur n’est pas dans le match', () => {
    const results: KoResults = { 'R32-1': { winnerId: 999, score: { home: 1, away: 0 } } }
    const bracket = buildBracket(qualified, results)
    expect(bracket.R32[0].winnerId).toBeNull()
    expect(bracket.R16[0].homeId).toBeNull()
  })
})
