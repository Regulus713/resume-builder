import { useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { flushSync } from 'react-dom'

const UI_ICONS = {
  upload: 'M12 15V3M7 8l5-5 5 5M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
  download: 'M12 3v12M7 10l5 5 5-5M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
  braces:
    'M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1',
  sparkles: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16v5M16.5 18.5h5',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
  pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  palette:
    'M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1.5 3.3A1.5 1.5 0 0 1 12 22zM7.5 10.5h.01M12 7.5h.01M16.5 10.5h.01',
  user: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  text: 'M4 6h16M4 12h16M4 18h10',
  briefcase:
    'M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18',
  graduation: 'M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z',
  globe:
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4',
  layout: 'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM4 9h16M9 9v11',
  droplet: 'M12 2.7l5.7 5.7a8 8 0 1 1-11.4 0z',
  type: 'M4 7V5h16v2M9 19h6M12 5v14',
  textSize: 'M3 19l5-14 5 14M5 14h6M15 19l3.5-9 3.5 9M16.2 16h4.6',
  page: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
  check: 'M5 12l5 5L20 7',
  chevronDown: 'M6 9l6 6 6-6',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDown: 'M12 5v14M19 12l-7 7-7-7',
  x: 'M18 6L6 18M6 6l12 12',
  plus: 'M12 5v14M5 12h14',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff:
    'M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2',
  tag: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
  list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  rows: 'M5 4h14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM5 13h14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 14l-1.5 7 5-3 5 3-1.5-7',
  heart:
    'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  quote: 'M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6',
  link: 'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
}

export type UiIconName = keyof typeof UI_ICONS

export function UiIcon({
  name,
  className = 'h-4 w-4',
  strokeWidth = 1.8,
}: {
  name: UiIconName
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={UI_ICONS[name]} />
    </svg>
  )
}

const inputBase =
  'w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-3 text-sm text-neutral-900 shadow-[inset_0_1px_1px_rgb(15_23_42/0.03)] transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/15 focus:outline-none'
const inputClass = `${inputBase} py-2`
const inputCompact = `${inputBase} py-1.5`

const labelClass = 'mb-1.5 block text-xs font-medium text-neutral-600'

/** Bare, compact styled input (no label). */
export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCompact} ${className}`} />
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className={labelClass}>{children}</span>
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  leading,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  /** Control rendered before the input (e.g. an icon picker). */
  leading?: ReactNode
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        {leading}
        <input
          id={id}
          className={inputClass}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  hint?: string
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <textarea
        className={`${inputClass} resize-y leading-relaxed`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="mt-1.5 block text-[11px] text-neutral-400">{hint}</span>}
    </label>
  )
}

export function Section({
  title,
  icon,
  badge,
  children,
  defaultOpen = false,
  openSignal,
  dataSection,
  rename,
  hidden,
  onToggleHidden,
}: {
  title: string
  icon: UiIconName
  /** Small count pill shown next to the title (hidden when undefined). */
  badge?: number
  children: ReactNode
  defaultOpen?: boolean
  /** When this value changes to a new non-null value, the section opens. */
  openSignal?: unknown
  dataSection?: string
  /** Enables the rename (pencil) action; empty value shows `placeholder`. */
  rename?: { value: string; placeholder: string; onChange: (v: string) => void }
  hidden?: boolean
  /** Enables the show/hide (eye) action. */
  onToggleHidden?: () => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [editing, setEditing] = useState(false)
  // Adjust-during-render: open the section when a new signal arrives.
  const [seenSignal, setSeenSignal] = useState(openSignal)
  if (openSignal !== seenSignal) {
    setSeenSignal(openSignal)
    if (openSignal != null) setOpen(true)
  }
  const iconBadge = (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
        hidden
          ? 'bg-neutral-100 text-neutral-400'
          : open
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
            : 'bg-blue-50 text-blue-600'
      }`}
    >
      <UiIcon name={icon} />
    </span>
  )
  return (
    <div
      className={`rounded-2xl border bg-white shadow-card transition-colors ${
        open ? 'border-blue-100' : 'border-neutral-200/70 hover:border-neutral-300/80'
      }`}
      data-section={dataSection}
    >
      <div className="flex items-center gap-1 py-3 pr-3 pl-3.5">
        {editing && rename ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {iconBadge}
            <input
              autoFocus
              className={`${inputCompact} font-semibold`}
              value={rename.value}
              placeholder={rename.placeholder}
              onChange={(e) => rename.onChange(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setEditing(false)
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            onDoubleClick={() => rename && setEditing(true)}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            {iconBadge}
            <span
              className={`truncate text-sm font-semibold ${
                hidden ? 'text-neutral-400 line-through decoration-neutral-300' : 'text-neutral-800'
              }`}
            >
              {title}
            </span>
            {badge !== undefined && (
              <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500 tabular-nums">
                {badge}
              </span>
            )}
          </button>
        )}
        {rename && !editing && (
          <IconButton label="Rename section" icon="pencil" onClick={() => setEditing(true)} />
        )}
        {onToggleHidden && (
          <IconButton
            label={hidden ? 'Show on resume' : 'Hide from resume'}
            icon={hidden ? 'eyeOff' : 'eye'}
            onClick={onToggleHidden}
            active={hidden}
          />
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Collapse' : 'Expand'}
          className="ml-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200"
        >
          <UiIcon
            name="chevronDown"
            className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            strokeWidth={2}
          />
        </button>
      </div>
      {open && <div className="panel-in space-y-3 px-3.5 pt-1 pb-4">{children}</div>}
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onSelect,
  size = 'md',
}: {
  options: { id: T; label: string; icon?: UiIconName }[]
  value: T
  onSelect: (id: T) => void
  size?: 'sm' | 'md'
}) {
  return (
    <div className="flex gap-1 rounded-full border border-neutral-200/70 bg-neutral-100/80 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onSelect(o.id)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full font-semibold transition ${
            size === 'sm' ? 'py-1 text-xs' : 'py-1.5 text-sm'
          } ${
            value === o.id
              ? 'bg-white text-blue-600 shadow-sm ring-1 ring-neutral-900/5'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          {o.icon && <UiIcon name={o.icon} className="h-3.5 w-3.5" strokeWidth={2} />}
          {o.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Editable list of short strings (tags, bullets, skills): type to edit,
 * Enter adds a row below, Backspace on an empty row removes it,
 * Alt+↑/↓ or the arrow buttons reorder. Empty rows are pruned when focus
 * leaves the list.
 */
export function ListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
  renderExtra,
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
  addLabel: string
  /** Extra per-row control after the input (e.g. a level input). */
  renderExtra?: (item: string, index: number) => ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const commit = (next: string[], focusIdx?: number) => {
    if (focusIdx === undefined) return onChange(next)
    flushSync(() => onChange(next))
    ref.current?.querySelector<HTMLInputElement>(`[data-row="${focusIdx}"]`)?.focus()
  }
  const move = (from: number, to: number, focus = false) => {
    const next = [...items]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    commit(next, focus ? to : undefined)
  }
  return (
    <div
      ref={ref}
      className="space-y-1.5"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget) && items.some((s) => !s.trim())) {
          onChange(items.filter((s) => s.trim()))
        }
      }}
    >
      {items.map((item, i) => (
        <div key={i} className="group flex items-center gap-1">
          <span className="w-5 shrink-0 text-right text-[11px] font-medium text-neutral-400 tabular-nums">
            {i + 1}
          </span>
          <input
            data-row={i}
            className={`${inputCompact} ml-1`}
            value={item}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...items]
              next[i] = e.target.value
              onChange(next)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const next = [...items]
                next.splice(i + 1, 0, '')
                commit(next, i + 1)
              } else if (e.key === 'Backspace' && item === '') {
                e.preventDefault()
                commit(
                  items.filter((_, j) => j !== i),
                  items.length > 1 ? Math.max(0, i - 1) : undefined,
                )
              } else if (e.altKey && e.key === 'ArrowUp' && i > 0) {
                e.preventDefault()
                move(i, i - 1, true)
              } else if (e.altKey && e.key === 'ArrowDown' && i < items.length - 1) {
                e.preventDefault()
                move(i, i + 1, true)
              }
            }}
          />
          {renderExtra?.(item, i)}
          <span className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <IconButton label="Move up" icon="arrowUp" disabled={i === 0} onClick={() => move(i, i - 1)} />
            <IconButton
              label="Move down"
              icon="arrowDown"
              disabled={i === items.length - 1}
              onClick={() => move(i, i + 1)}
            />
            <IconButton
              label="Remove"
              icon="x"
              danger
              onClick={() => commit(items.filter((_, j) => j !== i))}
            />
          </span>
        </div>
      ))}
      <AddButton label={addLabel} onClick={() => commit([...items, ''], items.length)} />
    </div>
  )
}

export function ItemCard({
  title,
  id,
  flash,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  children,
}: {
  title: string
  id?: string
  flash?: boolean
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  children: ReactNode
}) {
  return (
    <div
      id={id ? `panel-item-${id}` : undefined}
      className={`rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-3.5 ${flash ? 'entry-flash' : ''}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgb(59_130_246/0.15)]" />
          <span className="truncate text-xs font-semibold text-neutral-700">{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <IconButton label="Move up" icon="arrowUp" disabled={!canMoveUp} onClick={onMoveUp} />
          <IconButton
            label="Move down"
            icon="arrowDown"
            disabled={!canMoveDown}
            onClick={onMoveDown}
          />
          <IconButton label="Remove" icon="x" onClick={onRemove} danger />
        </span>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

export function IconButton({
  icon,
  label,
  onClick,
  disabled,
  danger,
  active,
}: {
  icon: UiIconName
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  /** Highlighted (toggled-on) state. */
  active?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border shadow-xs transition disabled:opacity-30 disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-neutral-400 ${
        active
          ? 'border-amber-200 bg-amber-50 text-amber-600'
          : 'border-neutral-200 bg-white text-neutral-400'
      } ${
        danger
          ? 'hover:border-red-200 hover:bg-red-50 hover:text-red-600'
          : 'hover:border-neutral-300 hover:text-neutral-700'
      }`}
    >
      <UiIcon name={icon} className="h-3.5 w-3.5" strokeWidth={2.2} />
    </button>
  )
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 py-2.5 text-sm font-medium text-neutral-500 transition hover:border-blue-400 hover:bg-blue-50/60 hover:text-blue-600"
    >
      <UiIcon name="plus" strokeWidth={2.2} />
      {label}
    </button>
  )
}
