import ChampionBanner from '@/components/ChampionBanner'
import KnockoutMatch from '@/components/KnockoutMatch'
import { useBracket } from '@/hooks/useBracket'
import { useStandings } from '@/hooks/useStandings'
import { ROUND_LABELS, ROUND_ORDER } from '@/logic/bracket'
import { isGroupComplete } from '@/logic/standings'
import { usePredictionStore } from '@/state/predictionStore'
import { useTournament } from '@/state/tournamentContext'
import type { KnockoutRound } from '@/types'

interface BracketViewProps {
  highlightedTeamId: number | null
  onSelectTeam: (teamId: number) => void
}

const ROW = 116
const CARD_WIDTH = 224
const CONNECTOR = 26

const LockedNotice = () => {
  const { groupIds, matchesByGroup } = useTournament()
  const groupScores = usePredictionStore(state => state.groupScores)
  useStandings()
  const done = groupIds.filter(group =>
    isGroupComplete(matchesByGroup[group], groupScores),
  ).length

  return (
    <div
      className="mx-auto max-w-md rounded-2xl border p-8 text-center"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
      }}>
      <h2 className="font-display text-xl font-bold">Tableau verrouillé</h2>
      <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
        Complétez les 12 groupes pour générer les 16èmes de finale.
      </p>
      <p
        className="mt-4 tabular text-2xl font-bold"
        style={{ color: 'var(--accent)' }}>
        {done} / {groupIds.length}
      </p>
    </div>
  )
}

const BracketView = ({ highlightedTeamId, onSelectTeam }: BracketViewProps) => {
  const { teamById } = useTournament()
  const bracket = useBracket()

  if (bracket.locked || !bracket.rounds) {
    return <LockedNotice />
  }

  const rounds = bracket.rounds
  const champion =
    bracket.championId !== null ? teamById.get(bracket.championId) : null
  const bodyHeight = rounds.R32.length * ROW

  return (
    <div className="grid gap-6">
      {champion ? <ChampionBanner champion={champion} /> : null}

      <div className="overflow-x-auto pb-4">
        <div className="flex" style={{ minWidth: 'max-content' }}>
          {ROUND_ORDER.map((round: KnockoutRound, roundIndex) => {
            const isLast = roundIndex === ROUND_ORDER.length - 1
            const slotGap = bodyHeight / rounds[round].length
            return (
              <div key={round} className="flex flex-col">
                <h3
                  className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: 'var(--text-faint)' }}>
                  {ROUND_LABELS[round]}
                </h3>
                <div
                  className="flex flex-col justify-around"
                  style={{ minHeight: bodyHeight }}>
                  {rounds[round].map((match, matchIndex) => (
                    <div key={match.id} className="flex items-stretch">
                      {roundIndex > 0 ? (
                        <div
                          aria-hidden
                          className="shrink-0 self-center"
                          style={{
                            width: CONNECTOR,
                            height: 2,
                            background: 'var(--border-strong)',
                          }}
                        />
                      ) : null}

                      <div
                        className="flex shrink-0 items-center px-3"
                        style={{ width: CARD_WIDTH + 24 }}>
                        <div style={{ width: CARD_WIDTH }}>
                          <KnockoutMatch
                            match={match}
                            highlightedTeamId={highlightedTeamId}
                            onSelectTeam={onSelectTeam}
                          />
                        </div>
                      </div>

                      {!isLast ? (
                        <div
                          aria-hidden
                          className="shrink-0 self-center"
                          style={{
                            width: CONNECTOR,
                            height: slotGap,
                            borderRight: '2px solid var(--border-strong)',
                            borderTop: '2px solid var(--border-strong)',
                            borderBottom: '2px solid var(--border-strong)',
                            borderRadius: '0 10px 10px 0',
                            marginTop:
                              matchIndex % 2 === 0 ? slotGap / 2 : -slotGap / 2,
                          }}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BracketView
