import { useMemo, useState } from 'react'
import rawData from '@/data/teams-2026.json'
import { parseTournament, TournamentDataError } from '@/logic/loadData'
import { TournamentProvider } from '@/state/TournamentProvider'
import ErrorScreen from '@/components/ErrorScreen'
import GroupsView from '@/components/GroupsView'

export default function App() {
  const parsed = useMemo(() => {
    try {
      return { tournament: parseTournament(rawData), error: null as null | string }
    } catch (error) {
      const message =
        error instanceof TournamentDataError
          ? error.message
          : 'Erreur inattendue lors du chargement des données.'
      return { tournament: null, error: message }
    }
  }, [])

  const [highlightedTeamId, setHighlightedTeamId] = useState<number | null>(null)

  if (parsed.error || !parsed.tournament) {
    return <ErrorScreen message={parsed.error ?? 'Données introuvables.'} />
  }

  function toggleHighlight(teamId: number) {
    setHighlightedTeamId((current) => (current === teamId ? null : teamId))
  }

  return (
    <TournamentProvider tournament={parsed.tournament}>
      <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
        <header className="mb-8">
          <p
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: 'var(--accent)' }}
          >
            {parsed.tournament.tournament}
          </p>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            World Cup Predictor
          </h1>
        </header>

        <GroupsView
          highlightedTeamId={highlightedTeamId}
          onSelectTeam={toggleHighlight}
        />
      </div>
    </TournamentProvider>
  )
}
