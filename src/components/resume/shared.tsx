import { ICON_PATHS, type IconName } from './utils'

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  )
}

export function AddRow({
  label,
  onClick,
  dark = false,
}: {
  label: string
  onClick: () => void
  dark?: boolean
}) {
  const colors = dark
    ? 'border-white/50 text-white/80 hover:border-white hover:bg-white/10 hover:text-white'
    : 'border-neutral-300 text-neutral-400 hover:border-(--accent) hover:bg-(--accent)/5 hover:text-(--accent)'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mt-[0.5em] block w-full rounded-md border border-dashed py-[0.45em] text-center text-[0.78em] font-medium transition-colors print:hidden ${colors}`}
    >
      + {label}
    </button>
  )
}

export function SectionHeading({
  title,
  className = '',
}: {
  title: string
  className?: string
}) {
  return (
    <h2
      className={`flex items-center gap-[0.8em] text-[0.8em] font-bold tracking-[0.18em] uppercase ${className}`}
    >
      {title}
    </h2>
  )
}
