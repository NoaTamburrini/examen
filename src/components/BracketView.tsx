import type { KnockoutRound } from '@/types'
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

export default function BracketView({
  highlightedTeamId,
  onSelectTeam,
}: BracketViewProps) {
  const { teamById } = useTournament()
  const bracket = useBracket()

  if (bracket.locked || !bracket.rounds) {
    return <LockedNotice />
  }

  const champion =
    bracket.championId !== null ? teamById.get(bracket.championId) : null

  return (
    <div className="grid gap-8">
      {champion ? <ChampionBanner champion={champion} /> : null}

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
          {ROUND_ORDER.map((round: KnockoutRound) => (
            <section key={round} className="flex w-64 shrink-0 flex-col">
              <h3
                className="mb-3 text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: 'var(--text-faint)' }}
              >
                {ROUND_LABELS[round]}
              </h3>
              <div className="flex flex-1 flex-col justify-around gap-3">
                {bracket.rounds![round].map((match) => (
                  <KnockoutMatch
                    key={match.id}
                    match={match}
                    highlightedTeamId={highlightedTeamId}
                    onSelectTeam={onSelectTeam}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
