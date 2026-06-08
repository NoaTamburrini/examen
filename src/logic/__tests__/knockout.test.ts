import { describe, expect, it } from 'vitest'
import { resolveKnockout } from '@/logic/knockout'

describe('resolveKnockout', () => {
  it('désigne le vainqueur au temps réglementaire', () => {
    const out = resolveKnockout({ homeId: 1, awayId: 2, score: { home: 2, away: 1 } })
    expect(out.winnerId).toBe(1)
    expect(out.needsExtraTime).toBe(false)
  })

  it('réclame les prolongations sur un nul', () => {
    const out = resolveKnockout({ homeId: 1, awayId: 2, score: { home: 1, away: 1 } })
    expect(out.winnerId).toBeNull()
    expect(out.needsExtraTime).toBe(true)
  })

  it('tranche en prolongations', () => {
    const out = resolveKnockout({
      homeId: 1,
      awayId: 2,
      score: { home: 1, away: 1 },
      extraTime: { home: 1, away: 0 },
    })
    expect(out.winnerId).toBe(1)
    expect(out.needsExtraTime).toBe(false)
  })

  it('réclame les tirs au but si la prolongation reste nulle', () => {
    const out = resolveKnockout({
      homeId: 1,
      awayId: 2,
      score: { home: 1, away: 1 },
      extraTime: { home: 0, away: 0 },
    })
    expect(out.winnerId).toBeNull()
    expect(out.needsPenalties).toBe(true)
  })

  it('tranche aux tirs au but', () => {
    const out = resolveKnockout({
      homeId: 1,
      awayId: 2,
      score: { home: 1, away: 1 },
      extraTime: { home: 0, away: 0 },
      penalties: { home: 4, away: 5 },
    })
    expect(out.winnerId).toBe(2)
  })

  it('renvoie aucun vainqueur sans score saisi', () => {
    const out = resolveKnockout({ homeId: 1, awayId: 2 })
    expect(out.winnerId).toBeNull()
    expect(out.needsExtraTime).toBe(false)
  })
})
