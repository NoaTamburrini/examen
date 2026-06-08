import type { Theme } from '@/hooks/useTheme'
import { MoonIcon, SunIcon } from '@phosphor-icons/react'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
      className="grid h-9 w-9 place-items-center rounded-lg transition"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
      }}>
      {isDark ? (
        <SunIcon size={18} weight="bold" />
      ) : (
        <MoonIcon size={18} weight="bold" />
      )}
    </button>
  )
}
