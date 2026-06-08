import { buildAllFixtures } from '@/logic/fixtures'
import { GROUP_IDS, indexTeamsById, teamsByGroup } from '@/logic/loadData'
import {
  TournamentContext,
  type TournamentContextValue,
} from '@/state/tournamentContext'
import type { GroupFixture, GroupId, Tournament } from '@/types'
import { useMemo, type ReactNode } from 'react'

export function TournamentProvider({
  tournament,
  children,
}: {
  tournament: Tournament
  children: ReactNode
}) {
  const value = useMemo<TournamentContextValue>(() => {
    const fixtures = buildAllFixtures(tournament.teams)
    const fixturesByGroup = {} as Record<GroupId, GroupFixture[]>
    for (const group of GROUP_IDS) {
      fixturesByGroup[group] = fixtures.filter(f => f.group === group)
    }
    return {
      tournament,
      groupIds: GROUP_IDS,
      teamById: indexTeamsById(tournament.teams),
      teamsByGroup: teamsByGroup(tournament.teams),
      fixtures,
      fixturesByGroup,
    }
  }, [tournament])

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  )
}
