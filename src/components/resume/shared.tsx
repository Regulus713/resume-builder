import type { ReactNode } from 'react'
import { EditableText } from './Editable'
import { BRAND_ICONS } from './brandIcons'
import { ICON_PATHS, isBrandIcon, type IconName } from './utils'

/**
 * Renamable built-in section heading. Pass `up.title(id, 'Default')`.
 * Clearing the text restores the template's default heading.
 */
export function EditableHeading({
  value,
  fallback,
  onChange,
}: {
  value: string
  fallback: string
  onChange: (v: string) => void
}) {
  return (
    <EditableText value={value || fallback} placeholder={fallback} onChange={onChange} />
  )
}

export function Icon({ name, className }: { name: IconName; className?: string }) {
  if (isBrandIcon(name)) {
    // Brand logos are solid and fill their box; the padded viewBox evens out
    // their visual weight next to the outline icons.
    return (
      <svg viewBox="-2 -2 28 28" fill="currentColor" className={className} aria-hidden>
        <path d={BRAND_ICONS[name].path} />
      </svg>
    )
  }
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

/**
 * Contact icon for templates designed without icons — hidden unless
 * Design → Contact icons is set to "Show" (see `.contact-icon-optional`).
 */
export function OptionalContactIcon({ name }: { name: IconName }) {
  return (
    <Icon name={name} className="contact-icon contact-icon-optional h-[1em] w-[1em] shrink-0" />
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
  title: ReactNode
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
