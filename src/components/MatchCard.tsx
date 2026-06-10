import Flag from '@/components/Flag'
import ScoreInput from '@/components/ScoreInput'
import type { Team } from '@/types'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface TeamSlot {
  team: Team | null
  placeholder?: string
  score: number | null
  onScore: (value: number | null) => void
}

interface MatchCardProps {
  home: TeamSlot
  away: TeamSlot
  winnerId?: number | null
  onSelectTeam?: (teamId: number) => void
  highlightedTeamId?: number | null
  disabled?: boolean
  footer?: ReactNode
}

const isWinner = (slot: TeamSlot, winnerId?: number | null): boolean =>
  Boolean(slot.team && winnerId != null && slot.team.id === winnerId)

const MatchCard = ({
  home,
  away,
  winnerId,
  onSelectTeam,
  highlightedTeamId,
  disabled,
  footer,
}: MatchCardProps) => {
  const reduceMotion = useReducedMotion()

  const renderRow = (slot: TeamSlot) => {
    const winner = isWinner(slot, winnerId)
    const highlighted = slot.team != null && highlightedTeamId === slot.team.id
    const clickable = Boolean(onSelectTeam && slot.team)

    return (
      <div
        className="flex items-center gap-2 px-2.5 py-1 transition"
        style={{
          background: winner ? 'var(--accent-soft)' : 'transparent',
          boxShadow: highlighted
            ? 'inset 3px 0 0 var(--accent)'
            : winner
              ? 'inset 3px 0 0 var(--accent)'
              : 'inset 3px 0 0 transparent',
        }}>
        <button
          type="button"
          disabled={!clickable}
          onClick={() => slot.team && onSelectTeam?.(slot.team.id)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default">
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={slot.team?.id ?? 'tbd'}
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26, opacity: { duration: 0.12 } }}
              className="flex min-w-0 flex-1 items-center gap-2">
              {slot.team ? (
                <>
                  <Flag code={slot.team.code} name={slot.team.name} size={18} />
                  <span
                    className="truncate text-sm"
                    style={{
                      color: winner ? 'var(--text)' : 'var(--text-muted)',
                      fontWeight: winner ? 700 : 500,
                    }}>
                    {slot.team.name}
                  </span>
                </>
              ) : (
                <span
                  className="truncate text-sm italic"
                  style={{ color: 'var(--text-faint)' }}>
                  {slot.placeholder ?? 'À déterminer'}
                </span>
              )}
            </motion.span>
          </AnimatePresence>
        </button>
        <ScoreInput
          value={slot.score}
          onChange={slot.onScore}
          ariaLabel={`Score ${slot.team?.name ?? slot.placeholder ?? ''}`}
          disabled={disabled || !slot.team}
        />
      </div>
    )
  }

  const containsHighlighted =
    highlightedTeamId != null &&
    (home.team?.id === highlightedTeamId || away.team?.id === highlightedTeamId)

  return (
    <div
      className="overflow-hidden rounded-xl border transition"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: containsHighlighted ? 'var(--accent)' : 'var(--border)',
      }}>
      {renderRow(home)}
      <div style={{ height: 1, background: 'var(--border)' }} />
      {renderRow(away)}
      {footer ? (
        <div
          className="border-t px-3 py-2"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-row)' }}>
          {footer}
        </div>
      ) : null}
    </div>
  )
}

export default MatchCard
