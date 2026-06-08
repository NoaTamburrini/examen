import MatchCard from '@/components/MatchCard'
import { usePredictionStore } from '@/state/predictionStore'
import { useTournament } from '@/state/tournamentContext'
import type { GroupFixture } from '@/types'

export const GroupMatch = ({
  fixture,
  onSelectTeam,
  highlightedTeamId,
}: {
  fixture: GroupFixture
  onSelectTeam: (teamId: number) => void
  highlightedTeamId: number | null
}) => {
  const { teamById } = useTournament()
  const score = usePredictionStore(state => state.groupScores[fixture.id])
  const setGroupScore = usePredictionStore(state => state.setGroupScore)

  const home = teamById.get(fixture.homeId)!
  const away = teamById.get(fixture.awayId)!

  function update(side: 'home' | 'away', value: number | null) {
    const current = score ?? { home: null, away: null }
    setGroupScore(fixture.id, { ...current, [side]: value })
  }

  return (
    <MatchCard
      home={{
        team: home,
        score: score?.home ?? null,
        onScore: v => update('home', v),
      }}
      away={{
        team: away,
        score: score?.away ?? null,
        onScore: v => update('away', v),
      }}
      onSelectTeam={onSelectTeam}
      highlightedTeamId={highlightedTeamId}
    />
  )
}
