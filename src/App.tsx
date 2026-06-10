import BracketView from '@/components/BracketView'
import ErrorScreen from '@/components/ErrorScreen'
import { GroupsView } from '@/components/Group/GroupsView'
import StatsView from '@/components/StatsView'
import ThemeToggle from '@/components/ThemeToggle'
import ViewTabs from '@/components/ViewTabs'
import rawData from '@/data/teams-2026.json'
import { useTheme } from '@/hooks/useTheme'
import { parseTournament, TournamentDataError } from '@/logic/loadData'
import { generateScenario } from '@/logic/randomFill'
import { TournamentProvider } from '@/state/TournamentProvider'
import { usePredictionStore } from '@/state/predictionStore'
import type { ViewKey } from '@/types'
import { useMemo, useState } from 'react'

const App = () => {
  const parsed = useMemo(() => {
    try {
      return {
        tournament: parseTournament(rawData),
        error: null as null | string,
      }
    } catch (error) {
      const message =
        error instanceof TournamentDataError
          ? error.message
          : 'Erreur inattendue lors du chargement des données.'
      return { tournament: null, error: message }
    }
  }, [])

  const [view, setView] = useState<ViewKey>('groups')
  const [highlightedTeamId, setHighlightedTeamId] = useState<number | null>(
    null,
  )
  const reset = usePredictionStore(state => state.reset)
  const loadScenario = usePredictionStore(state => state.loadScenario)
  const [theme, toggleTheme] = useTheme()

  if (parsed.error || !parsed.tournament) {
    return <ErrorScreen message={parsed.error ?? 'Données introuvables.'} />
  }

  const tournament = parsed.tournament

  const toggleHighlight = (teamId: number) => {
    setHighlightedTeamId(current => (current === teamId ? null : teamId))
  }

  const randomize = () => {
    loadScenario(generateScenario(tournament.teams, tournament.format))
  }

  const viewContent = {
    groups: (
      <GroupsView
        highlightedTeamId={highlightedTeamId}
        onSelectTeam={toggleHighlight}
      />
    ),
    bracket: (
      <BracketView
        highlightedTeamId={highlightedTeamId}
        onSelectTeam={toggleHighlight}
      />
    ),
    stats: <StatsView onSelectTeam={toggleHighlight} />,
  }[view]

  return (
    <TournamentProvider tournament={tournament}>
      <div className="mx-auto max-w-400 px-4 py-5 md:px-6">
        <header className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: 'var(--accent)' }}>
              {tournament.tournament}
            </p>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              World Cup Predictor
            </h1>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={randomize}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold transition"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-contrast)',
              }}>
              Tirage aléatoire
            </button>
            <button
              onClick={reset}
              className="rounded-lg px-3 py-1.5 text-sm font-medium transition"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}>
              Réinitialiser
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        <div className="mb-6">
          <ViewTabs active={view} onChange={setView} />
        </div>

        {viewContent}
      </div>
    </TournamentProvider>
  )
}

export default App
