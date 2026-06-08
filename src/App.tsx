import { useMemo, useState } from 'react'
import rawData from '@/data/teams-2026.json'
import { parseTournament, TournamentDataError } from '@/logic/loadData'
import { TournamentProvider } from '@/state/TournamentProvider'
import { usePredictionStore } from '@/state/predictionStore'
import { useTheme } from '@/hooks/useTheme'
import ErrorScreen from '@/components/ErrorScreen'
import ThemeToggle from '@/components/ThemeToggle'
import GroupsView from '@/components/GroupsView'
import BracketView from '@/components/BracketView'
import StatsView from '@/components/StatsView'
import ViewTabs, { type ViewKey } from '@/components/ViewTabs'

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

  const [view, setView] = useState<ViewKey>('groups')
  const [highlightedTeamId, setHighlightedTeamId] = useState<number | null>(null)
  const reset = usePredictionStore((state) => state.reset)
  const [theme, toggleTheme] = useTheme()

  if (parsed.error || !parsed.tournament) {
    return <ErrorScreen message={parsed.error ?? 'Données introuvables.'} />
  }

  function toggleHighlight(teamId: number) {
    setHighlightedTeamId((current) => (current === teamId ? null : teamId))
  }

  return (
    <TournamentProvider tournament={parsed.tournament}>
      <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: 'var(--accent)' }}
            >
              {parsed.tournament.tournament}
            </p>
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              World Cup Predictor
            </h1>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={reset}
              className="rounded-lg px-3 py-1.5 text-sm font-medium transition"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              Réinitialiser
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        <div className="mb-6">
          <ViewTabs active={view} onChange={setView} />
        </div>

        {view === 'groups' ? (
          <GroupsView
            highlightedTeamId={highlightedTeamId}
            onSelectTeam={toggleHighlight}
          />
        ) : null}
        {view === 'bracket' ? (
          <BracketView
            highlightedTeamId={highlightedTeamId}
            onSelectTeam={toggleHighlight}
          />
        ) : null}
        {view === 'stats' ? <StatsView onSelectTeam={toggleHighlight} /> : null}
      </div>
    </TournamentProvider>
  )
}
