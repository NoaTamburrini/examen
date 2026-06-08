import Flag from '@/components/Flag'
import { useBracket } from '@/hooks/useBracket'
import { useStandings } from '@/hooks/useStandings'
import { computeStats } from '@/logic/stats'
import { useTournament } from '@/state/tournamentContext'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

interface StatsViewProps {
  onSelectTeam: (teamId: number) => void
}

function Tile({
  label,
  children,
  span,
}: {
  label: string
  children: ReactNode
  span?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${span ? 'sm:col-span-2' : ''}`}
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
      }}>
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]"
        style={{ color: 'var(--text-faint)' }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function TeamLine({
  code,
  name,
  value,
  onClick,
}: {
  code: string
  name: string
  value: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 text-left">
      <span className="flex items-center gap-2.5">
        <Flag code={code} name={name} size={28} />
        <span className="font-display text-lg font-bold">{name}</span>
      </span>
      <span
        className="tabular text-lg font-bold"
        style={{ color: 'var(--accent)' }}>
        {value}
      </span>
    </button>
  )
}

export default function StatsView({ onSelectTeam }: StatsViewProps) {
  const { teamById } = useTournament()
  const standings = useStandings()
  const bracket = useBracket()

  const stats = useMemo(
    () => computeStats(standings, bracket.qualified, bracket.rounds, teamById),
    [standings, bracket.qualified, bracket.rounds, teamById],
  )

  if (stats.matchesPlayed === 0) {
    return (
      <div
        className="mx-auto max-w-md rounded-2xl border p-8 text-center"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
        }}>
        <h2 className="font-display text-xl font-bold">
          Pas encore de données
        </h2>
        <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          Saisissez des scores pour voir apparaître les statistiques.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.champion ? (
        <Tile label="Champion du monde" span>
          <TeamLine
            code={stats.champion.code}
            name={stats.champion.name}
            value="Vainqueur"
            onClick={() => onSelectTeam(stats.champion!.id)}
          />
        </Tile>
      ) : null}

      {stats.topScoringTeam ? (
        <Tile label="Meilleure attaque (poules)">
          <TeamLine
            code={stats.topScoringTeam.team.code}
            name={stats.topScoringTeam.team.name}
            value={`${stats.topScoringTeam.goals} buts`}
            onClick={() => onSelectTeam(stats.topScoringTeam!.team.id)}
          />
        </Tile>
      ) : null}

      {stats.bestDefense ? (
        <Tile label="Meilleure défense (poules)">
          <TeamLine
            code={stats.bestDefense.team.code}
            name={stats.bestDefense.team.name}
            value={`${stats.bestDefense.conceded} encaissés`}
            onClick={() => onSelectTeam(stats.bestDefense!.team.id)}
          />
        </Tile>
      ) : null}

      <Tile label="Buts en phase de groupes">
        <p className="font-display text-4xl font-bold">{stats.totalGoals}</p>
        <p
          className="mt-1 tabular text-sm"
          style={{ color: 'var(--text-muted)' }}>
          {stats.averageGoals.toFixed(2)} / match
        </p>
      </Tile>

      {stats.qualifiedByConfederation.length > 0 ? (
        <Tile label="Confédérations qualifiées" span>
          <ul className="grid gap-2">
            {stats.qualifiedByConfederation.map(row => (
              <li
                key={row.confederation}
                className="flex items-center justify-between gap-3">
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text)' }}>
                  {row.confederation}
                </span>
                <span
                  className="tabular text-sm font-bold"
                  style={{ color: 'var(--accent)' }}>
                  {row.count}
                </span>
              </li>
            ))}
          </ul>
        </Tile>
      ) : null}

      {stats.finalists.length === 2 ? (
        <Tile label="Finalistes">
          <div className="grid gap-2">
            {stats.finalists.map(finalist => (
              <TeamLine
                key={finalist.id}
                code={finalist.code}
                name={finalist.name}
                value=""
                onClick={() => onSelectTeam(finalist.id)}
              />
            ))}
          </div>
        </Tile>
      ) : null}
    </div>
  )
}
