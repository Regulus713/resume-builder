import type { LevelStyle } from '../types'
import { LevelIndicator } from './resume/Level'
import { levelLabel, type LevelLabelSet } from './resume/utils'
import { FieldLabel } from './ui'

const STYLES: { id: LevelStyle; label: string }[] = [
  { id: 'none', label: 'Off' },
  { id: 'stars', label: 'Stars' },
  { id: 'dots', label: 'Bulbs' },
  { id: 'bar', label: 'Slider' },
  { id: 'blocks', label: 'Blocks' },
  { id: 'text', label: 'Words' },
]

/** Row of style choices, each with a live preview of a level-4 indicator. */
export function LevelStylePicker({
  value,
  onChange,
  label = 'Level display',
  labels = 'generic',
}: {
  value: LevelStyle
  onChange: (style: LevelStyle) => void
  label?: string
  labels?: LevelLabelSet
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid grid-cols-6 gap-1 rounded-2xl border border-neutral-200/70 bg-neutral-100/80 p-1">
        {STYLES.map((s) => {
          const active = value === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              aria-pressed={active}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 pt-2 pb-1.5 transition ${
                active
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-neutral-900/5'
                  : 'text-neutral-500 hover:bg-white/60 hover:text-neutral-800'
              }`}
            >
              <span className="flex h-3 w-full items-center justify-center text-[8px]">
                {s.id === 'none' ? (
                  <span className="text-[10px] leading-none font-semibold">Aa</span>
                ) : (
                  <LevelIndicator
                    value={4}
                    style={s.id}
                    labels={labels}
                    className={s.id === 'bar' ? 'w-[80%]' : s.id === 'text' ? 'text-[9px]' : ''}
                  />
                )}
              </span>
              <span className="text-[10px] font-semibold">{s.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Compact 1–5 input for panel rows: click a bulb to set, click again to clear. */
export function LevelInput({
  value,
  onChange,
  labels = 'generic',
}: {
  value: number
  onChange: (level: number) => void
  labels?: LevelLabelSet
}) {
  return (
    <span
      className="flex shrink-0 items-center rounded-lg px-1 text-[13px] text-blue-600"
      title={levelLabel(value, labels) || 'Set level (1–5)'}
    >
      <LevelIndicator value={value} style="dots" labels={labels} onChange={onChange} />
    </span>
  )
}
