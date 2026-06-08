import { useMemo } from 'react'
import rawData from './data/teams-2026.json'
import { parseTournament, TournamentDataError } from './logic/loadData'
import ErrorScreen from './components/ErrorScreen'

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

  if (parsed.error || !parsed.tournament) {
    return <ErrorScreen message={parsed.error ?? 'Données introuvables.'} />
  }

  const { tournament } = parsed

  return (
    <div className="min-h-[100dvh] grid place-items-center px-4">
      <div className="text-center">
        <p
          className="text-sm uppercase tracking-[0.3em]"
          style={{ color: 'var(--accent)' }}
        >
          {tournament.tournament}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold mt-3">
          World Cup Predictor
        </h1>
        <p className="mt-4 tabular text-sm" style={{ color: 'var(--text-muted)' }}>
          {tournament.teams.length} équipes · {tournament.format.groupCount} groupes
        </p>
      </div>
    </div>
  )
}
