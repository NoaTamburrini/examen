import Flag from '@/components/Flag'
import type { Team } from '@/types'

interface ChampionBannerProps {
  champion: Team
}

export default function ChampionBanner({ champion }: ChampionBannerProps) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl border px-8 py-6 text-center"
      style={{
        background: 'var(--accent-soft)',
        borderColor: 'var(--accent)',
      }}>
      <span
        className="text-xs font-semibold uppercase tracking-[0.3em]"
        style={{ color: 'var(--accent)' }}>
        Champion du monde
      </span>
      <Flag code={champion.code} name={champion.name} size={64} />
      <span
        className="font-display text-3xl font-bold"
        style={{ color: 'var(--text)' }}>
        {champion.name}
      </span>
    </div>
  )
}
