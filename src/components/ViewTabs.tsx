export type ViewKey = 'groups' | 'bracket' | 'stats'

interface ViewTabsProps {
  active: ViewKey
  onChange: (view: ViewKey) => void
}

const TABS: Array<{ key: ViewKey; label: string }> = [
  { key: 'groups', label: 'Phase de groupes' },
  { key: 'bracket', label: 'Tableau final' },
  { key: 'stats', label: 'Statistiques' },
]

const ViewTabs = ({ active, onChange }: ViewTabsProps) => {
  return (
    <div
      role="tablist"
      aria-label="Navigation"
      className="inline-flex rounded-xl p-1"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
      }}>
      {TABS.map(tab => {
        const selected = active === tab.key
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold transition md:px-4"
            style={{
              background: selected ? 'var(--accent)' : 'transparent',
              color: selected ? 'var(--accent-contrast)' : 'var(--text-muted)',
            }}>
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default ViewTabs
