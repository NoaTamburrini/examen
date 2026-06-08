import { GroupCard } from '@/components/Group/GroupCard'
import { useTournament } from '@/state/tournamentContext'

interface GroupsViewProps {
  highlightedTeamId: number | null
  onSelectTeam: (teamId: number) => void
}

export const GroupsView = ({
  highlightedTeamId,
  onSelectTeam,
}: GroupsViewProps) => {
  const { groupIds } = useTournament()
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {groupIds.map(group => (
        <GroupCard
          key={group}
          group={group}
          highlightedTeamId={highlightedTeamId}
          onSelectTeam={onSelectTeam}
        />
      ))}
    </div>
  )
}
