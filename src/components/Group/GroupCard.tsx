import { GroupMatch } from '@/components/Group/GroupMatch'
import GroupTable from '@/components/Group/GroupTable'
import { useStandings } from '@/hooks/useStandings'
import { isGroupComplete } from '@/logic/standings'
import { usePredictionStore } from '@/state/predictionStore'
import { useTournament } from '@/state/tournamentContext'
import type { GroupId } from '@/types'

export const GroupCard = ({
  group,
  highlightedTeamId,
  onSelectTeam,
}: {
  group: GroupId
  highlightedTeamId: number | null
  onSelectTeam: (teamId: number) => void
}) => {
  const { matchesByGroup } = useTournament()
  const standings = useStandings()
  const groupScores = usePredictionStore(state => state.groupScores)
  const fixtures = matchesByGroup[group]
  const complete = isGroupComplete(fixtures, groupScores)

  return (
    <section
      className="rounded-xl border p-3"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}>
      <header className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-base font-bold tracking-wide">
          Groupe {group}
        </h2>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            background: complete ? 'var(--accent-soft)' : 'var(--bg-row)',
            color: complete ? 'var(--accent)' : 'var(--text-faint)',
          }}>
          {complete ? 'Complet' : 'En cours'}
        </span>
      </header>

      <GroupTable
        standings={standings[group]}
        highlightedTeamId={highlightedTeamId}
        onSelectTeam={onSelectTeam}
      />

      <div className="mt-3 grid gap-1.5">
        {fixtures.map(fixture => (
          <GroupMatch
            key={fixture.id}
            fixture={fixture}
            onSelectTeam={onSelectTeam}
            highlightedTeamId={highlightedTeamId}
          />
        ))}
      </div>
    </section>
  )
}
