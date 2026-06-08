import { useMemo } from 'react'
import type { GroupId, Standing } from '@/types'
import { computeGroupStanding } from '@/logic/standings'
import { useTournament } from '@/state/tournamentContext'
import { usePredictionStore } from '@/state/predictionStore'

export function useStandings(): Record<GroupId, Standing[]> {
  const { groupIds, teamsByGroup, fixturesByGroup } = useTournament()
  const groupScores = usePredictionStore((state) => state.groupScores)

  return useMemo(() => {
    const result = {} as Record<GroupId, Standing[]>
    for (const group of groupIds) {
      result[group] = computeGroupStanding(
        teamsByGroup[group],
        fixturesByGroup[group],
        groupScores,
      )
    }
    return result
  }, [groupIds, teamsByGroup, fixturesByGroup, groupScores])
}
