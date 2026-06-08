import { useStandings } from '@/hooks/useStandings'
import { buildBracket, collectQualified, getChampion } from '@/logic/bracket'
import { isGroupComplete } from '@/logic/standings'
import { usePredictionStore } from '@/state/predictionStore'
import { useTournament } from '@/state/tournamentContext'
import type { BracketMatch, KnockoutRound, QualifiedTeam } from '@/types'
import { useMemo } from 'react'

export interface BracketData {
  locked: boolean
  qualified: QualifiedTeam[]
  rounds: Record<KnockoutRound, BracketMatch[]> | null
  championId: number | null
}

export function useBracket(): BracketData {
  const { groupIds, fixturesByGroup, tournament } = useTournament()
  const standings = useStandings()
  const groupScores = usePredictionStore(state => state.groupScores)
  const koInputs = usePredictionStore(state => state.koInputs)

  const allComplete = useMemo(
    () =>
      groupIds.every(group =>
        isGroupComplete(fixturesByGroup[group], groupScores),
      ),
    [groupIds, fixturesByGroup, groupScores],
  )

  return useMemo(() => {
    if (!allComplete) {
      return { locked: true, qualified: [], rounds: null, championId: null }
    }
    const qualified = collectQualified(
      standings,
      tournament.format.bestThirdPlaces,
    )
    const rounds = buildBracket(qualified, koInputs)
    return {
      locked: false,
      qualified,
      rounds,
      championId: getChampion(rounds),
    }
  }, [allComplete, standings, koInputs, tournament.format.bestThirdPlaces])
}
