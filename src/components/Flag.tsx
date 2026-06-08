interface FlagProps {
  code: string
  name: string
  size?: number
}

export default function Flag({ code, name, size = 24 }: FlagProps) {
  return (
    <img
      src={`https://flagcdn.com/w160/${code}.png`}
      alt={`Drapeau ${name}`}
      width={size}
      height={Math.round((size * 2) / 3)}
      loading="lazy"
      className="shrink-0 rounded-[3px] object-cover"
      style={{
        width: size,
        height: Math.round((size * 2) / 3),
        boxShadow: '0 0 0 1px var(--border) inset',
      }}
    />
  )
}
