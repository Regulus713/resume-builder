import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import type { LevelStyle } from '../../types'
import type { CustomTheme } from './CustomSections'
import { EditableText } from './Editable'
import { LEVEL_MAX, levelLabel, type LevelLabelSet } from './utils'

type ShownStyle = Exclude<LevelStyle, 'none'>

const STAR =
  'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z'

/**
 * A 1–5 level drawn as stars, bulbs (dots), a slider bar, blocks or a word.
 * Colors come from `currentColor` (empty units are faded). With `onChange`
 * it is interactive: click / hover to preview, arrow keys to adjust, click
 * the current level again to clear. An unset level (0) is a faint ghost on
 * screen and hidden in print.
 */
export function LevelIndicator({
  value,
  style,
  labels = 'generic',
  onChange,
  className = '',
}: {
  value: number
  style: ShownStyle
  labels?: LevelLabelSet
  onChange?: (level: number) => void
  className?: string
}) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  const label = levelLabel(value, labels)
  const pick = (n: number) => onChange?.(n === value ? 0 : n)
  const units = Array.from({ length: LEVEL_MAX }, (_, i) => i + 1)

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!onChange) return
    const map: Record<string, number> = {
      ArrowRight: Math.min(LEVEL_MAX, value + 1),
      ArrowUp: Math.min(LEVEL_MAX, value + 1),
      ArrowLeft: Math.max(1, value - 1),
      ArrowDown: Math.max(1, value - 1),
      Home: 1,
      End: LEVEL_MAX,
      Delete: 0,
      Backspace: 0,
    }
    if (e.key in map) {
      e.preventDefault()
      onChange(map[e.key])
    }
  }

  /** Level under the pointer for the continuous bar. */
  const barLevel = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return Math.min(LEVEL_MAX, Math.max(1, Math.ceil(((e.clientX - r.left) / r.width) * LEVEL_MAX)))
  }

  const a11y = onChange
    ? {
        role: 'slider',
        tabIndex: 0,
        'aria-valuemin': 1,
        'aria-valuemax': LEVEL_MAX,
        'aria-valuenow': value || undefined,
        'aria-valuetext': label || 'Not set',
        onKeyDown,
      }
    : { role: 'img', 'aria-label': label || 'Not set' }

  const root = `level-indicator inline-flex shrink-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-current/40 rounded-[0.2em] ${
    onChange ? 'cursor-pointer' : ''
  } ${value ? '' : 'opacity-50 print:hidden'} ${className}`

  if (style === 'text') {
    return (
      <span
        {...a11y}
        title={onChange ? 'Click to change level' : undefined}
        onClick={() => onChange?.((value % LEVEL_MAX) + 1)}
        className={`${root} font-medium`}
      >
        {label || 'Set level'}
      </span>
    )
  }

  if (style === 'bar') {
    return (
      <span
        {...a11y}
        title={label || 'Click to set level'}
        onMouseMove={(e) => onChange && setHover(barLevel(e))}
        onMouseLeave={() => setHover(0)}
        onClick={(e) => pick(barLevel(e))}
        className={`${root} relative h-[0.42em] min-w-[3.5em] overflow-hidden rounded-full`}
      >
        <span className="absolute inset-0 rounded-full bg-current opacity-20" />
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-current transition-[width] duration-150"
          style={{ width: `${(shown / LEVEL_MAX) * 100}%` }}
        />
      </span>
    )
  }

  return (
    <span
      {...a11y}
      title={label || 'Click to set level'}
      onMouseLeave={() => setHover(0)}
      className={`${root} ${style === 'blocks' ? 'gap-[0.18em]' : 'gap-[0.2em]'}`}
    >
      {units.map((n) => {
        const on = n <= shown
        const unit = `${on ? '' : 'opacity-25'} transition-opacity`
        return (
          <span
            key={n}
            onMouseEnter={() => onChange && setHover(n)}
            onClick={() => pick(n)}
            className="inline-flex"
          >
            {style === 'stars' && (
              <svg viewBox="0 0 24 24" className={`h-[1em] w-[1em] ${unit}`} aria-hidden>
                <path d={STAR} fill="currentColor" />
              </svg>
            )}
            {style === 'dots' && (
              <span className={`h-[0.62em] w-[0.62em] rounded-full bg-current ${unit}`} />
            )}
            {style === 'blocks' && (
              <span className={`h-[0.45em] w-[1em] rounded-[0.12em] bg-current ${unit}`} />
            )}
          </span>
        )
      })}
    </span>
  )
}

function focusEnd(el: HTMLElement | null | undefined) {
  if (!el) return
  el.focus()
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

/**
 * Items with a level each ("English ●●●●●"), styled from the template's
 * `CustomTheme`: names use `theme.text`, indicators the accent color (or the
 * text color on dark backgrounds). Narrow (stacked) columns get one column,
 * wide ones two. Names are editable inline; Enter adds an item.
 */
export function LevelList({
  items,
  levels,
  style,
  labels,
  onItems,
  onLevel,
  theme,
  columns,
  placeholder = 'Item',
}: {
  items: string[]
  levels: Record<string, number>
  style: ShownStyle
  labels: LevelLabelSet
  onItems: (items: string[]) => void
  onLevel: (item: string, level: number) => void
  theme: CustomTheme
  columns?: number
  placeholder?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const cols = columns ?? (theme.entry.stacked ? 1 : 2)
  // Words ("Fluent") match the item names' size; graphic styles are a bit smaller.
  const size = style === 'text' ? (theme.text.match(/text-\[[\d.]+em\]/)?.[0] ?? '') : 'text-[0.8em]'
  const commitAndFocus = (next: string[], idx: number) => {
    flushSync(() => onItems(next))
    focusEnd(ref.current?.querySelector<HTMLElement>(`[data-level-item="${idx}"]`))
  }

  return (
    <div
      ref={ref}
      className="grid gap-x-[1.8em] gap-y-[0.4em]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex min-w-0 items-center justify-between gap-[0.8em] break-inside-avoid ${
            item.trim() ? '' : 'print:hidden'
          }`}
        >
          <EditableText
            value={item}
            placeholder={placeholder}
            domProps={{ 'data-level-item': String(i) }}
            className={`min-w-0 ${theme.text.replace(/\btext-center\b/, '')}`}
            onChange={(v) => onItems(items.map((x, j) => (j === i ? v : x)))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitAndFocus([...items.slice(0, i + 1), '', ...items.slice(i + 1)], i + 1)
              } else if (e.key === 'Backspace' && item === '' && items.length > 1) {
                e.preventDefault()
                commitAndFocus(
                  items.filter((_, j) => j !== i),
                  Math.max(0, i - 1),
                )
              }
            }}
            onCommit={(v) => {
              if (!v.trim()) onItems(items.filter((_, j) => j !== i))
            }}
          />
          <LevelIndicator
            value={levels[item.trim()] ?? 0}
            style={style}
            labels={labels}
            onChange={(n) => onLevel(item, n)}
            className={`${style === 'bar' ? 'w-[40%]' : ''} ${
              theme.dark ? '' : (theme.levelColor ?? 'text-(--accent)')
            } ${size}`}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => commitAndFocus([...items, ''], items.length)}
        className="justify-self-start rounded-[0.3em] border border-dashed border-current px-[0.6em] py-[0.1em] text-[0.72em] opacity-40 transition-opacity hover:opacity-90 print:hidden"
      >
        + Add
      </button>
    </div>
  )
}

/** Progress indicator under an education entry; renders nothing when off. */
export function EducationLevel({
  value,
  style,
  onChange,
  className = '',
}: {
  value: number
  style: LevelStyle
  onChange: (level: number) => void
  className?: string
}) {
  if (style === 'none') return null
  return (
    <div className={`mt-[0.3em] flex text-[0.78em] ${value ? '' : 'print:hidden'} ${className}`}>
      <LevelIndicator
        value={value}
        style={style}
        onChange={onChange}
        className={style === 'bar' ? 'w-full max-w-[11em]' : ''}
      />
    </div>
  )
}
