import type { GroupFixture, GroupId, Team, Tournament } from '@/types'
import { createContext, useContext } from 'react'

export interface TournamentContextValue {
  tournament: Tournament
  groupIds: GroupId[]
  teamById: Map<number, Team>
  teamsByGroup: Record<GroupId, Team[]>
  fixtures: GroupFixture[]
  fixturesByGroup: Record<GroupId, GroupFixture[]>
}

export const TournamentContext = createContext<TournamentContextValue | null>(
  null,
)

export function useTournament(): TournamentContextValue {
  const value = useContext(TournamentContext)
  if (!value) {
    throw new Error(
      'useTournament doit être utilisé dans un TournamentProvider.',
    )
  }
  return value
}
