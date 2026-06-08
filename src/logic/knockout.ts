import type { KoInput, KoResult, MatchScore, PartialScore } from '@/types'

export interface KoEntry {
  homeId: number
  awayId: number
  score?: MatchScore
  extraTime?: MatchScore
  penalties?: MatchScore
}

function complete(score?: PartialScore): MatchScore | undefined {
  if (!score || score.home === null || score.away === null) return undefined
  return { home: score.home, away: score.away }
}

export function toKoEntry(
  homeId: number,
  awayId: number,
  input: KoInput,
): KoEntry {
  return {
    homeId,
    awayId,
    score: complete(input.score),
    extraTime: complete(input.extraTime),
    penalties: complete(input.penalties),
  }
}

export interface KoOutcome {
  winnerId: number | null
  needsExtraTime: boolean
  needsPenalties: boolean
}

function aggregate(a?: MatchScore, b?: MatchScore): MatchScore | null {
  if (!a) return null
  if (!b) return a
  return { home: a.home + b.home, away: a.away + b.away }
}

export function resolveKnockout(entry: KoEntry): KoOutcome {
  const { score, extraTime, penalties } = entry

  if (!score) {
    return { winnerId: null, needsExtraTime: false, needsPenalties: false }
  }

  if (score.home !== score.away) {
    return {
      winnerId: score.home > score.away ? entry.homeId : entry.awayId,
      needsExtraTime: false,
      needsPenalties: false,
    }
  }

  const afterExtra = aggregate(score, extraTime)
  if (!extraTime) {
    return { winnerId: null, needsExtraTime: true, needsPenalties: false }
  }
  if (afterExtra && afterExtra.home !== afterExtra.away) {
    return {
      winnerId: afterExtra.home > afterExtra.away ? entry.homeId : entry.awayId,
      needsExtraTime: false,
      needsPenalties: false,
    }
  }

  if (!penalties) {
    return { winnerId: null, needsExtraTime: false, needsPenalties: true }
  }
  if (penalties.home === penalties.away) {
    return { winnerId: null, needsExtraTime: false, needsPenalties: true }
  }
  return {
    winnerId: penalties.home > penalties.away ? entry.homeId : entry.awayId,
    needsExtraTime: false,
    needsPenalties: false,
  }
}

export function buildKoResult(entry: KoEntry): KoResult | null {
  const outcome = resolveKnockout(entry)
  if (outcome.winnerId === null) return null
  return {
    score: entry.score,
    extraTime: entry.extraTime,
    penalties: entry.penalties,
    winnerId: outcome.winnerId,
  }
}
