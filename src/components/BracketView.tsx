import type { BracketMatch, KnockoutRound } from '@/types'
import { useTournament } from '@/state/tournamentContext'
import { usePredictionStore } from '@/state/predictionStore'
import { useBracket } from '@/hooks/useBracket'
import { useStandings } from '@/hooks/useStandings'
import { isGroupComplete } from '@/logic/standings'
import { ROUND_LABELS, ROUND_ORDER } from '@/logic/bracket'
import KnockoutMatch from '@/components/KnockoutMatch'
import ChampionBanner from '@/components/ChampionBanner'

interface BracketViewProps {
  highlightedTeamId: number | null
  onSelectTeam: (teamId: number) => void
}

const CONNECTOR_WIDTH = 28

function LockedNotice() {
  const { groupIds, fixturesByGroup } = useTournament()
  const groupScores = usePredictionStore((state) => state.groupScores)
  useStandings()
  const done = groupIds.filter((group) =>
    isGroupComplete(fixturesByGroup[group], groupScores),
  ).length

  return (
    <div
      className="mx-auto max-w-md rounded-2xl border p-8 text-center"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
    >
      <h2 className="font-display text-xl font-bold">Tableau verrouillé</h2>
      <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
        Complétez les 12 groupes pour générer les 16èmes de finale.
      </p>
      <p className="mt-4 tabular text-2xl font-bold" style={{ color: 'var(--accent)' }}>
        {done} / {groupIds.length}
      </p>
    </div>
  )
}

function MatchWrapper({
  match,
  isFirstRound,
  isLastRound,
  pairPosition,
  highlightedTeamId,
  onSelectTeam,
}: {
  match: BracketMatch
  isFirstRound: boolean
  isLastRound: boolean
  pairPosition: 'top' | 'bottom'
  highlightedTeamId: number | null
  onSelectTeam: (teamId: number) => void
}) {
  return (
    <div className="flex flex-1 items-center">
      {!isFirstRound ? (
        <div
          aria-hidden
          style={{
            width: CONNECTOR_WIDTH,
            height: 2,
            background: 'var(--border-strong)',
          }}
        />
      ) : null}

      <div className="w-56">
        <KnockoutMatch
          match={match}
          highlightedTeamId={highlightedTeamId}
          onSelectTeam={onSelectTeam}
        />
      </div>

      {!isLastRound ? (
        <div className="flex self-stretch" aria-hidden>
          <div
            style={{
              width: CONNECTOR_WIDTH / 2,
              height: 2,
              alignSelf: 'center',
              background: 'var(--border-strong)',
            }}
          />
          <div
            style={{
              width: CONNECTOR_WIDTH / 2,
              borderColor: 'var(--border-strong)',
              borderStyle: 'solid',
              borderWidth:
                pairPosition === 'top'
                  ? '2px 2px 0 0'
                  : '0 2px 2px 0',
              borderTopRightRadius: pairPosition === 'top' ? 8 : 0,
              borderBottomRightRadius: pairPosition === 'bottom' ? 8 : 0,
              marginTop: pairPosition === 'top' ? '50%' : 0,
              marginBottom: pairPosition === 'bottom' ? '50%' : 0,
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

export default function BracketView({
  highlightedTeamId,
  onSelectTeam,
}: BracketViewProps) {
  const { teamById } = useTournament()
  const bracket = useBracket()

  if (bracket.locked || !bracket.rounds) {
    return <LockedNotice />
  }

  const rounds = bracket.rounds
  const champion =
    bracket.championId !== null ? teamById.get(bracket.championId) : null

  return (
    <div className="grid gap-6">
      {champion ? <ChampionBanner champion={champion} /> : null}

      <div className="overflow-x-auto pb-4">
        <div className="flex" style={{ minWidth: 'max-content' }}>
          {ROUND_ORDER.map((round: KnockoutRound, roundIndex) => (
            <div key={round} className="flex flex-col">
              <h3
                className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: 'var(--text-faint)' }}
              >
                {ROUND_LABELS[round]}
              </h3>
              <div className="flex flex-1 flex-col">
                {rounds[round].map((match, matchIndex) => (
                  <MatchWrapper
                    key={match.id}
                    match={match}
                    isFirstRound={roundIndex === 0}
                    isLastRound={roundIndex === ROUND_ORDER.length - 1}
                    pairPosition={matchIndex % 2 === 0 ? 'top' : 'bottom'}
                    highlightedTeamId={highlightedTeamId}
                    onSelectTeam={onSelectTeam}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
