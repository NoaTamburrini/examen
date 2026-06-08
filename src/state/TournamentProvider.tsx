import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { GroupFixture, GroupId, Team, Tournament } from '@/types'
import { buildAllFixtures } from '@/logic/fixtures'
import { GROUP_IDS, indexTeamsById, teamsByGroup } from '@/logic/loadData'

interface TournamentContextValue {
  tournament: Tournament
  groupIds: GroupId[]
  teamById: Map<number, Team>
  teamsByGroup: Record<GroupId, Team[]>
  fixtures: GroupFixture[]
  fixturesByGroup: Record<GroupId, GroupFixture[]>
}

const TournamentContext = createContext<TournamentContextValue | null>(null)

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
      fixturesByGroup[group] = fixtures.filter((f) => f.group === group)
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

export function useTournament(): TournamentContextValue {
  const value = useContext(TournamentContext)
  if (!value) {
    throw new Error('useTournament doit être utilisé dans un TournamentProvider.')
  }
  return value
}
