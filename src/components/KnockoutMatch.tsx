import MatchCard from '@/components/MatchCard'
import ScoreInput from '@/components/ScoreInput'
import { usePredictionStore } from '@/state/predictionStore'
import { useTournament } from '@/state/tournamentContext'
import type { BracketMatch, KoInput, PartialScore } from '@/types'

interface KnockoutMatchProps {
  match: BracketMatch
  highlightedTeamId: number | null
  onSelectTeam: (teamId: number) => void
}

const emptyInput = (): KoInput => ({})

const tieRow = (
  label: string,
  score: PartialScore | undefined,
  onChange: (side: 'home' | 'away', value: number | null) => void,
  homeLabel: string,
  awayLabel: string,
) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className="text-xs font-semibold"
        style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <ScoreInput
          value={score?.home ?? null}
          onChange={v => onChange('home', v)}
          ariaLabel={`${label} ${homeLabel}`}
        />
        <span style={{ color: 'var(--text-faint)' }}>-</span>
        <ScoreInput
          value={score?.away ?? null}
          onChange={v => onChange('away', v)}
          ariaLabel={`${label} ${awayLabel}`}
        />
      </div>
    </div>
  )
}

const KnockoutMatch = ({
  match,
  highlightedTeamId,
  onSelectTeam,
}: KnockoutMatchProps) => {
  const { teamById } = useTournament()
  const input = usePredictionStore(state => state.koInputs[match.id])
  const setKoInput = usePredictionStore(state => state.setKoInput)

  const home = match.homeId !== null ? teamById.get(match.homeId)! : null
  const away = match.awayId !== null ? teamById.get(match.awayId)! : null
  const ready = home !== null && away !== null
  const current = input ?? emptyInput()

  const isDraw = (score?: PartialScore): boolean =>
    score != null &&
    score.home !== null &&
    score.away !== null &&
    score.home === score.away

  const isComplete = (score?: PartialScore): boolean =>
    score != null && score.home !== null && score.away !== null

  const sum = (a?: PartialScore, b?: PartialScore): PartialScore => ({
    home: (a?.home ?? 0) + (b?.home ?? 0),
    away: (a?.away ?? 0) + (b?.away ?? 0),
  })

  const updateScore = (
    field: 'score' | 'extraTime' | 'penalties',
    side: 'home' | 'away',
    value: number | null,
  ) => {
    const existing = current[field] ?? { home: null, away: null }
    const next: KoInput = {
      ...current,
      [field]: { ...existing, [side]: value },
    }

    if (!isDraw(next.score)) {
      delete next.extraTime
      delete next.penalties
    } else if (
      !isComplete(next.extraTime) ||
      !isDraw(sum(next.score, next.extraTime))
    ) {
      delete next.penalties
    }
    setKoInput(match.id, next)
  }

  const showExtraTime = isDraw(current.score)
  const showPenalties =
    showExtraTime &&
    isComplete(current.extraTime) &&
    isDraw(sum(current.score, current.extraTime))

  const footer =
    ready && (showExtraTime || showPenalties) ? (
      <div className="grid gap-2">
        {showExtraTime
          ? tieRow(
              'Prolongation',
              current.extraTime,
              (side, v) => updateScore('extraTime', side, v),
              home!.name,
              away!.name,
            )
          : null}
        {showPenalties
          ? tieRow(
              'Tirs au but',
              current.penalties,
              (side, v) => updateScore('penalties', side, v),
              home!.name,
              away!.name,
            )
          : null}
      </div>
    ) : null

  return (
    <MatchCard
      home={{
        team: home,
        score: current.score?.home ?? null,
        onScore: v => updateScore('score', 'home', v),
      }}
      away={{
        team: away,
        score: current.score?.away ?? null,
        onScore: v => updateScore('score', 'away', v),
      }}
      winnerId={match.winnerId}
      onSelectTeam={onSelectTeam}
      highlightedTeamId={highlightedTeamId}
      disabled={!ready}
      footer={footer}
    />
  )
}

export default KnockoutMatch
