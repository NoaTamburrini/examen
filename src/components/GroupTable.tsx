import type { Standing } from '@/types'
import Flag from '@/components/Flag'

interface GroupTableProps {
  standings: Standing[]
  highlightedTeamId?: number | null
  onSelectTeam?: (teamId: number) => void
}

function qualificationColor(rank: number): string {
  if (rank <= 2) return 'var(--accent)'
  if (rank === 3) return 'var(--gold)'
  return 'var(--text-faint)'
}

export default function GroupTable({
  standings,
  highlightedTeamId,
  onSelectTeam,
}: GroupTableProps) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr style={{ color: 'var(--text-faint)' }}>
          <th className="py-1.5 pl-2 text-left font-medium" colSpan={2}>
            Équipe
          </th>
          <th className="px-1 text-center font-medium tabular">J</th>
          <th className="px-1 text-center font-medium tabular">Diff</th>
          <th className="px-1 text-center font-medium tabular">BP</th>
          <th className="px-1.5 text-right font-medium tabular">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((row) => {
          const highlighted = highlightedTeamId === row.team.id
          return (
            <tr
              key={row.team.id}
              onClick={() => onSelectTeam?.(row.team.id)}
              className="cursor-pointer transition"
              style={{
                background: highlighted ? 'var(--accent-soft)' : 'transparent',
                borderTop: '1px solid var(--border)',
              }}
            >
              <td className="py-2 pl-2" style={{ width: 28 }}>
                <span
                  className="tabular inline-grid h-5 w-5 place-items-center rounded text-xs font-bold"
                  style={{
                    color: 'var(--accent-contrast)',
                    background: qualificationColor(row.rank),
                  }}
                >
                  {row.rank}
                </span>
              </td>
              <td className="py-2 pr-2">
                <div className="flex items-center gap-2">
                  <Flag code={row.team.code} name={row.team.name} size={20} />
                  <span className="truncate" style={{ color: 'var(--text)' }}>
                    {row.team.name}
                  </span>
                </div>
              </td>
              <td className="tabular px-1 text-center" style={{ color: 'var(--text-muted)' }}>
                {row.played}
              </td>
              <td className="tabular px-1 text-center" style={{ color: 'var(--text-muted)' }}>
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </td>
              <td className="tabular px-1 text-center" style={{ color: 'var(--text-muted)' }}>
                {row.goalsFor}
              </td>
              <td
                className="tabular px-1.5 text-right font-bold"
                style={{ color: 'var(--text)' }}
              >
                {row.points}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
