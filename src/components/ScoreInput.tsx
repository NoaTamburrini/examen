interface ScoreInputProps {
  value: number | null
  onChange: (value: number | null) => void
  ariaLabel: string
  disabled?: boolean
}

const MAX_GOALS = 99

export default function ScoreInput({
  value,
  onChange,
  ariaLabel,
  disabled,
}: ScoreInputProps) {
  function handleChange(raw: string) {
    if (raw === '') {
      onChange(null)
      return
    }
    if (!/^\d{1,2}$/.test(raw)) return
    const parsed = Number(raw)
    if (parsed > MAX_GOALS) return
    onChange(parsed)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label={ariaLabel}
      disabled={disabled}
      value={value ?? ''}
      onChange={(event) => handleChange(event.target.value)}
      className="tabular h-8 w-8 rounded-md text-center text-sm font-semibold outline-none transition focus:ring-2 disabled:opacity-40"
      style={{
        background: 'var(--bg-row)',
        color: 'var(--text)',
        border: '1px solid var(--border-strong)',
      }}
    />
  )
}
