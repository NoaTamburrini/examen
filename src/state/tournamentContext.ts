import type { GroupMatchup, GroupId, Team, Tournament } from '@/types'
import { createContext, useContext } from 'react'

export interface TournamentContextValue {
  tournament: Tournament
  groupIds: GroupId[]
  teamById: Map<number, Team>
  teamsByGroup: Record<GroupId, Team[]>
  matches: GroupMatchup[]
  matchesByGroup: Record<GroupId, GroupMatchup[]>
}

export const TournamentContext = createContext<TournamentContextValue | null>(
  null,
)

export const useTournament = (): TournamentContextValue => {
  const value = useContext(TournamentContext)
  if (!value) {
    throw new Error(
      'useTournament doit être utilisé dans un TournamentProvider.',
    )
  }
  return value
}
