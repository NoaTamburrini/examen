import MatchCard from '@/components/MatchCard'
import ScoreInput from '@/components/ScoreInput'
import { resolveKnockout, toKoEntry } from '@/logic/knockout'
import { usePredictionStore } from '@/state/predictionStore'
import { useTournament } from '@/state/tournamentContext'
import type { BracketMatch, KoInput, PartialScore } from '@/types'

interface KnockoutMatchProps {
  match: BracketMatch
  highlightedTeamId: number | null
  onSelectTeam: (teamId: number) => void
}

function emptyInput(): KoInput {
  return {}
}

function tieRow(
  label: string,
  score: PartialScore | undefined,
  onChange: (side: 'home' | 'away', value: number | null) => void,
  homeLabel: string,
  awayLabel: string,
) {
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

export default function KnockoutMatch({
  match,
  highlightedTeamId,
  onSelectTeam,
}: KnockoutMatchProps) {
  const { teamById } = useTournament()
  const input = usePredictionStore(state => state.koInputs[match.id])
  const setKoInput = usePredictionStore(state => state.setKoInput)

  const home = match.homeId !== null ? teamById.get(match.homeId)! : null
  const away = match.awayId !== null ? teamById.get(match.awayId)! : null
  const ready = home !== null && away !== null
  const current = input ?? emptyInput()

  function patch(part: Partial<KoInput>) {
    setKoInput(match.id, { ...current, ...part })
  }

  function updateScore(
    field: 'score' | 'extraTime' | 'penalties',
    side: 'home' | 'away',
    value: number | null,
  ) {
    const existing = current[field] ?? { home: null, away: null }
    patch({ [field]: { ...existing, [side]: value } })
  }

  const outcome =
    ready && match.homeId !== null && match.awayId !== null
      ? resolveKnockout(toKoEntry(match.homeId, match.awayId, current))
      : null

  const showExtraTime = outcome?.needsExtraTime || Boolean(current.extraTime)
  const showPenalties = outcome?.needsPenalties || Boolean(current.penalties)

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
        placeholder: match.homeSource,
        score: current.score?.home ?? null,
        onScore: v => updateScore('score', 'home', v),
      }}
      away={{
        team: away,
        placeholder: match.awaySource,
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
