import { buildAllMatches } from '@/logic/matches'
import { GROUP_IDS, indexTeamsById, teamsByGroup } from '@/logic/loadData'
import {
  TournamentContext,
  type TournamentContextValue,
} from '@/state/tournamentContext'
import type { GroupMatchup, GroupId, Tournament } from '@/types'
import { useMemo, type ReactNode } from 'react'

export const TournamentProvider = ({
  tournament,
  children,
}: {
  tournament: Tournament
  children: ReactNode
}) => {
  const value = useMemo<TournamentContextValue>(() => {
    const fixtures = buildAllMatches(tournament.teams)
    const matchesByGroup = {} as Record<GroupId, GroupMatchup[]>
    for (const group of GROUP_IDS) {
      matchesByGroup[group] = fixtures.filter(f => f.group === group)
    }
    return {
      tournament,
      groupIds: GROUP_IDS,
      teamById: indexTeamsById(tournament.teams),
      teamsByGroup: teamsByGroup(tournament.teams),
      fixtures,
      matchesByGroup,
    }
  }, [tournament])

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  )
}
