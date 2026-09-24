import { useEffect, useRef, useState } from 'react'
import { BRAND_ICONS, type BrandIcon } from './resume/brandIcons'
import { Icon } from './resume/shared'
import { GENERIC_CONTACT_ICONS, iconTitle, type ContactIcon } from './resume/utils'
import { Input } from './ui'

const BRANDS = Object.keys(BRAND_ICONS) as BrandIcon[]

/**
 * Square button showing a contact item's icon; opens a searchable grid of
 * generic + brand icons. Choosing "Auto-detect" clears the override.
 */
export default function IconPicker({
  value,
  auto,
  isAuto,
  onChange,
  compact = false,
}: {
  /** Icon currently shown on the resume. */
  value: ContactIcon
  /** What auto-detection picks from the label/value. */
  auto: ContactIcon
  isAuto: boolean
  onChange: (icon: ContactIcon | null) => void
  /** Match the height of compact inputs. */
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const q = query.trim().toLowerCase()
  const matches = (title: string, id: string) => !q || title.toLowerCase().includes(q) || id.includes(q)
  const generic = GENERIC_CONTACT_ICONS.filter((g) => matches(g.title, g.id))
  const brands = BRANDS.filter((b) => matches(BRAND_ICONS[b].title, b))

  const pick = (icon: ContactIcon | null) => {
    onChange(icon)
    setOpen(false)
    setQuery('')
  }

  const cell = (id: ContactIcon, title: string) => {
    const active = !isAuto && value === id
    return (
      <button
        key={id}
        type="button"
        title={title}
        aria-label={title}
        onClick={() => pick(id)}
        className={`flex aspect-square items-center justify-center rounded-lg transition ${
          active
            ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
        }`}
      >
        <Icon name={id} className="h-[18px] w-[18px]" />
      </button>
    )
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={`Icon: ${iconTitle(value)}${isAuto ? ' (auto)' : ''} — click to change`}
        aria-label="Change icon"
        aria-expanded={open}
        className={`relative flex items-center ${compact ? 'h-[34px] w-[34px]' : 'h-[38px] w-[38px]'} justify-center rounded-xl border bg-white shadow-xs transition hover:border-blue-300 hover:text-blue-600 ${
          open ? 'border-blue-400 text-blue-600 ring-4 ring-blue-500/15' : 'border-neutral-200 text-neutral-600'
        }`}
      >
        <Icon name={value} className="h-[18px] w-[18px]" />
        {!isAuto && (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white"
          />
        )}
      </button>

      {open && (
        <div className="panel-in absolute top-full left-0 z-30 mt-1.5 w-72 rounded-2xl border border-neutral-200 bg-white p-2.5 shadow-float">
          <Input
            autoFocus
            placeholder="Search icons…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            onClick={() => pick(null)}
            className={`mt-2 flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-xs transition ${
              isAuto ? 'bg-blue-50 text-blue-700' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-xs ring-1 ring-neutral-200">
              <Icon name={auto} className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className="font-semibold">Auto-detect</span>
              <span className="text-neutral-400"> · {iconTitle(auto)}</span>
            </span>
          </button>
          <div className="soft-scroll mt-2 max-h-64 space-y-2 overflow-y-auto">
            {generic.length > 0 && (
              <div>
                <div className="mb-1 px-1 text-[10px] font-semibold tracking-wide text-neutral-400 uppercase">
                  General
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {generic.map((g) => cell(g.id, g.title))}
                </div>
              </div>
            )}
            {brands.length > 0 && (
              <div>
                <div className="mb-1 px-1 text-[10px] font-semibold tracking-wide text-neutral-400 uppercase">
                  Brands
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {brands.map((b) => cell(b, BRAND_ICONS[b].title))}
                </div>
              </div>
            )}
            {!generic.length && !brands.length && (
              <p className="px-1 py-3 text-center text-xs text-neutral-400">
                No icons match “{query}”.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
