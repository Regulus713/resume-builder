import { useState, type ReactNode } from 'react'

const inputClass =
  'w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-600">{label}</span>
      <input
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
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
      <span className="mb-1 block text-xs font-medium text-neutral-600">{label}</span>
      <textarea
        className={`${inputClass} resize-y`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span>}
    </label>
  )
}

export function Section({
  title,
  children,
  defaultOpen = false,
  openSignal,
  dataSection,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  /** When this value changes to a new non-null value, the section opens. */
  openSignal?: unknown
  dataSection?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  // Adjust-during-render: open the section when a new signal arrives.
  const [seenSignal, setSeenSignal] = useState(openSignal)
  if (openSignal !== seenSignal) {
    setSeenSignal(openSignal)
    if (openSignal != null) setOpen(true)
  }
  return (
    <div className="border-b border-neutral-200" data-section={dataSection}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
      >
        {title}
        <svg
          className={`h-4 w-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && <div className="space-y-3 px-4 pb-4">{children}</div>}
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
      className={`rounded-md border border-neutral-200 bg-neutral-50/60 p-3 ${flash ? 'entry-flash' : ''}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="truncate text-xs font-semibold text-neutral-700">{title}</span>
        <span className="flex shrink-0 items-center gap-0.5">
          <MiniButton label="Move up" disabled={!canMoveUp} onClick={onMoveUp}>
            <path d="M10 4l-5 6h10l-5-6z" fill="currentColor" stroke="none" />
          </MiniButton>
          <MiniButton label="Move down" disabled={!canMoveDown} onClick={onMoveDown}>
            <path d="M10 16l5-6H5l5 6z" fill="currentColor" stroke="none" />
          </MiniButton>
          <MiniButton label="Remove" onClick={onRemove} danger>
            <path
              d="M6 6l8 8M14 6l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </MiniButton>
        </span>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function MiniButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded p-1 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent ${
        danger ? 'hover:text-red-600' : 'hover:text-neutral-700'
      }`}
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20">
        {children}
      </svg>
    </button>
  )
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-neutral-300 py-2 text-sm font-medium text-neutral-500 hover:border-blue-400 hover:text-blue-600"
    >
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 5a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 0110 5z" />
      </svg>
      {label}
    </button>
  )
}
