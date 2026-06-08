import type { GroupFixture, GroupId } from '@/types'
import { useTournament } from '@/state/tournamentContext'
import { usePredictionStore } from '@/state/predictionStore'
import { useStandings } from '@/hooks/useStandings'
import { isGroupComplete } from '@/logic/standings'
import MatchCard from '@/components/MatchCard'
import GroupTable from '@/components/GroupTable'

interface GroupsViewProps {
  highlightedTeamId: number | null
  onSelectTeam: (teamId: number) => void
}

function GroupMatch({
  fixture,
  onSelectTeam,
  highlightedTeamId,
}: {
  fixture: GroupFixture
  onSelectTeam: (teamId: number) => void
  highlightedTeamId: number | null
}) {
  const { teamById } = useTournament()
  const score = usePredictionStore((state) => state.groupScores[fixture.id])
  const setGroupScore = usePredictionStore((state) => state.setGroupScore)

  const home = teamById.get(fixture.homeId)!
  const away = teamById.get(fixture.awayId)!

  function update(side: 'home' | 'away', value: number | null) {
    const current = score ?? { home: null, away: null }
    setGroupScore(fixture.id, { ...current, [side]: value })
  }

  return (
    <MatchCard
      home={{ team: home, score: score?.home ?? null, onScore: (v) => update('home', v) }}
      away={{ team: away, score: score?.away ?? null, onScore: (v) => update('away', v) }}
      onSelectTeam={onSelectTeam}
      highlightedTeamId={highlightedTeamId}
    />
  )
}

function GroupCard({
  group,
  highlightedTeamId,
  onSelectTeam,
}: {
  group: GroupId
  highlightedTeamId: number | null
  onSelectTeam: (teamId: number) => void
}) {
  const { fixturesByGroup } = useTournament()
  const standings = useStandings()
  const groupScores = usePredictionStore((state) => state.groupScores)
  const fixtures = fixturesByGroup[group]
  const complete = isGroupComplete(fixtures, groupScores)

  return (
    <section
      className="rounded-2xl border p-4"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold tracking-wide">
          Groupe {group}
        </h2>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{
            background: complete ? 'var(--accent-soft)' : 'var(--bg-row)',
            color: complete ? 'var(--accent)' : 'var(--text-faint)',
          }}
        >
          {complete ? 'Complet' : 'En cours'}
        </span>
      </header>

      <GroupTable
        standings={standings[group]}
        highlightedTeamId={highlightedTeamId}
        onSelectTeam={onSelectTeam}
      />

      <div className="mt-4 grid gap-2">
        {fixtures.map((fixture) => (
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

export default function GroupsView({
  highlightedTeamId,
  onSelectTeam,
}: GroupsViewProps) {
  const { groupIds } = useTournament()
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {groupIds.map((group) => (
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
