import type { ReactNode } from 'react'
import {
  ACCENT_PRESETS,
  FONT_LABELS,
  FONT_STACKS,
  type ContactIconMode,
  type DesignOptions,
  type FontId,
  type FontSize,
  type PageSize,
  type TemplateId,
} from '../types'
import { Segmented, UiIcon, type UiIconName } from './ui'

const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  { id: 'classic', label: 'Classic', desc: 'Single column, traditional' },
  { id: 'sidebar', label: 'Sidebar', desc: 'Two columns, tinted rail' },
  { id: 'modern', label: 'Modern', desc: 'Colored header, timeline' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean, understated' },
  { id: 'compact', label: 'Compact', desc: 'Dense, fits more' },
  { id: 'elegant', label: 'Elegant', desc: 'Centered, refined rules' },
  { id: 'rightrail', label: 'Right rail', desc: 'Dark accent rail' },
  { id: 'latex', label: 'LaTeX', desc: 'FAANG-style, pure B&W' },
  { id: 'executive', label: 'Executive', desc: 'Big name, understated' },
  { id: 'banner', label: 'Banner', desc: 'Color header, split body' },
  { id: 'timeline', label: 'Timeline', desc: 'Icon badges, gray rail' },
]

const FONTS: FontId[] = ['inter', 'serif', 'georgia', 'mono']
const SIZES: { id: FontSize; label: string }[] = [
  { id: 'sm', label: 'S' },
  { id: 'md', label: 'M' },
  { id: 'lg', label: 'L' },
]
const PAGES: { id: PageSize; label: string }[] = [
  { id: 'a4', label: 'A4' },
  { id: 'letter', label: 'US Letter' },
]
const ICON_MODES: { id: ContactIconMode; label: string; icon: UiIconName }[] = [
  { id: 'template', label: 'Template', icon: 'layout' },
  { id: 'show', label: 'Show', icon: 'eye' },
  { id: 'hide', label: 'Hide', icon: 'eyeOff' },
]

function Group({
  title,
  icon,
  value,
  children,
}: {
  title: string
  icon: UiIconName
  /** Current selection, shown on the right of the heading. */
  value?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-neutral-200/70 bg-white p-3.5 shadow-card">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <UiIcon name={icon} className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <h3 className="flex-1 text-sm font-semibold text-neutral-800">{title}</h3>
        {value && (
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">
            {value}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

function SelectedCheck({ className = '' }: { className?: string }) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-600/40 ${className}`}
    >
      <UiIcon name="check" className="h-3 w-3" strokeWidth={3} />
    </span>
  )
}

export default function DesignPanel({
  design,
  onChange,
}: {
  design: DesignOptions
  onChange: (d: DesignOptions) => void
}) {
  const set = <K extends keyof DesignOptions>(key: K, value: DesignOptions[K]) =>
    onChange({ ...design, [key]: value })
  const isCustomColor = !ACCENT_PRESETS.includes(design.accentColor)

  return (
    <div className="space-y-2.5">
      <Group
        title="Template"
        icon="layout"
        value={TEMPLATES.find((t) => t.id === design.template)?.label}
      >
        <div className="grid grid-cols-3 gap-2.5">
          {TEMPLATES.map((t) => {
            const active = design.template === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => set('template', t.id)}
                className={`group relative flex flex-col rounded-2xl border p-2 text-left transition ${
                  active
                    ? 'border-blue-500 bg-blue-50/60 ring-4 ring-blue-500/15'
                    : 'border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-card'
                }`}
              >
                {active && <SelectedCheck className="absolute top-3 right-3" />}
                <TemplateThumb id={t.id} active={active} />
                <div className="mt-2 px-0.5 text-xs font-semibold text-neutral-800">
                  {t.label}
                </div>
                <div className="px-0.5 text-[10px] leading-tight text-neutral-500">
                  {t.desc}
                </div>
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Accent color" icon="droplet" value={design.accentColor.toUpperCase()}>
        <div className="grid grid-cols-9 gap-2 p-0.5">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Accent ${c}`}
              onClick={() => set('accentColor', c)}
              className={`flex aspect-square w-full items-center justify-center rounded-full text-white shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1),0_1px_2px_rgb(0_0_0/0.15)] transition hover:scale-110 ${
                design.accentColor === c ? 'ring-2 ring-neutral-800/80 ring-offset-2' : ''
              }`}
              style={{ backgroundColor: c }}
            >
              {design.accentColor === c && (
                <UiIcon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
              )}
            </button>
          ))}
          <label
            className={`relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-full text-white shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1),0_1px_2px_rgb(0_0_0/0.15)] transition hover:scale-110 ${
              isCustomColor ? 'ring-2 ring-neutral-800/80 ring-offset-2' : ''
            }`}
            style={{
              background: isCustomColor
                ? design.accentColor
                : 'conic-gradient(#ef4444, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #ef4444)',
            }}
            title="Custom color"
          >
            <input
              type="color"
              value={design.accentColor}
              onChange={(e) => set('accentColor', e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer rounded-full opacity-0"
            />
            <UiIcon
              name={isCustomColor ? 'check' : 'plus'}
              className="pointer-events-none h-3.5 w-3.5"
              strokeWidth={3}
            />
          </label>
        </div>
      </Group>

      <Group title="Font" icon="type" value={FONT_LABELS[design.font]}>
        <div className="grid grid-cols-2 gap-2.5">
          {FONTS.map((f) => {
            const active = design.font === f
            return (
              <button
                key={f}
                type="button"
                onClick={() => set('font', f)}
                className={`relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                  active
                    ? 'border-blue-500 bg-blue-50/60 ring-4 ring-blue-500/15'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-card'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-semibold ${
                    active ? 'bg-white text-blue-600 shadow-sm' : 'bg-neutral-100 text-neutral-800'
                  }`}
                  style={{ fontFamily: FONT_STACKS[f] }}
                >
                  Aa
                </span>
                <span className="text-xs font-medium text-neutral-700">{FONT_LABELS[f]}</span>
              </button>
            )
          })}
        </div>
      </Group>

      <div className="grid grid-cols-2 gap-2.5">
        <Group title="Size" icon="textSize">
          <Segmented options={SIZES} value={design.fontSize} onSelect={(v) => set('fontSize', v)} />
        </Group>
        <Group title="Page" icon="page">
          <Segmented options={PAGES} value={design.pageSize} onSelect={(v) => set('pageSize', v)} />
        </Group>
      </div>

      <Group title="Contact icons" icon="link">
        <Segmented
          options={ICON_MODES}
          value={design.contactIcons}
          onSelect={(v) => set('contactIcons', v)}
        />
        <p className="mt-2 text-[11px] leading-snug text-neutral-400">
          &ldquo;Template&rdquo; shows icons only in templates designed with them.
          Change each field&apos;s icon in Content → Personal details.
        </p>
      </Group>
    </div>
  )
}

function TemplateThumb({ id, active }: { id: TemplateId; active: boolean }) {
  const c = active ? '#3b82f6' : '#cbd5e1'
  const t = '#94a3b8'
  return (
    <svg
      viewBox="0 0 60 80"
      className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs"
    >
      {id === 'classic' && (
        <>
          <rect x="10" y="8" width="40" height="5" rx="1" fill={t} />
          <rect x="18" y="16" width="24" height="3" rx="1" fill={c} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="10" y={28 + i * 16} width="14" height="3" rx="1" fill={c} />
              <rect x="10" y={34 + i * 16} width="40" height="2.5" rx="1" fill={t} opacity="0.6" />
              <rect x="10" y={38 + i * 16} width="34" height="2.5" rx="1" fill={t} opacity="0.4" />
            </g>
          ))}
        </>
      )}
      {id === 'sidebar' && (
        <>
          <rect x="0" y="0" width="22" height="80" fill={c} opacity="0.18" />
          <rect x="4" y="8" width="14" height="3" rx="1" fill={c} />
          <rect x="4" y="14" width="14" height="2" rx="1" fill={t} opacity="0.6" />
          <rect x="4" y="26" width="14" height="3" rx="1" fill={c} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="4" y={32 + i * 5} width="14" height="2" rx="1" fill={t} opacity="0.5" />
          ))}
          <rect x="26" y="8" width="30" height="4" rx="1" fill={t} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="26" y={20 + i * 18} width="12" height="3" rx="1" fill={c} />
              <rect x="26" y={25 + i * 18} width="30" height="2.5" rx="1" fill={t} opacity="0.6" />
              <rect x="26" y={29 + i * 18} width="24" height="2.5" rx="1" fill={t} opacity="0.4" />
            </g>
          ))}
        </>
      )}
      {id === 'modern' && (
        <>
          <rect x="0" y="0" width="60" height="18" fill={c} />
          <rect x="8" y="6" width="24" height="4" rx="1" fill="#fff" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle cx="12" cy={26 + i * 18} r="2" fill={c} />
              <rect x="18" y={24 + i * 18} width="16" height="3" rx="1" fill={t} />
              <rect x="18" y={29 + i * 18} width="34" height="2.5" rx="1" fill={t} opacity="0.6" />
              <rect x="18" y={33 + i * 18} width="28" height="2.5" rx="1" fill={t} opacity="0.4" />
            </g>
          ))}
        </>
      )}
      {id === 'minimal' && (
        <>
          <rect x="10" y="8" width="30" height="5" rx="1" fill={t} />
          <rect x="10" y="16" width="16" height="3" rx="1" fill={c} />
          <rect x="10" y="22" width="40" height="1" fill={t} opacity="0.4" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="10" y={30 + i * 15} width="10" height="2.5" rx="1" fill={c} />
              <rect x="10" y={35 + i * 15} width="40" height="2" rx="1" fill={t} opacity="0.5" />
              <rect x="10" y={38.5 + i * 15} width="32" height="2" rx="1" fill={t} opacity="0.35" />
            </g>
          ))}
        </>
      )}
      {id === 'compact' && (
        <>
          <rect x="8" y="6" width="22" height="5" rx="1" fill={t} />
          <rect x="8" y="13" width="44" height="2" fill={c} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="8" y={21 + i * 13} width="12" height="2.5" rx="1" fill={c} />
              <rect x="8" y={25 + i * 13} width="44" height="2" rx="1" fill={t} opacity="0.5" />
              <rect x="8" y={28.5 + i * 13} width="38" height="2" rx="1" fill={t} opacity="0.35" />
            </g>
          ))}
        </>
      )}
      {id === 'elegant' && (
        <>
          <rect x="15" y="7" width="30" height="5" rx="1" fill={t} />
          <rect x="22" y="15" width="16" height="2.5" rx="1" fill={c} />
          <rect x="14" y="21" width="32" height="2" fill={c} opacity="0.5" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="10" y={29 + i * 16} width="12" height="1" fill={c} />
              <rect x="38" y={29 + i * 16} width="12" height="1" fill={c} />
              <rect x="24" y={27.5 + i * 16} width="12" height="3" rx="1" fill={c} />
              <rect x="15" y={34 + i * 16} width="30" height="2" rx="1" fill={t} opacity="0.5" />
              <rect x="19" y={38 + i * 16} width="22" height="2" rx="1" fill={t} opacity="0.35" />
            </g>
          ))}
        </>
      )}
      {id === 'rightrail' && (
        <>
          <rect x="8" y="6" width="24" height="5" rx="1" fill={t} />
          <rect x="8" y="13" width="14" height="3" rx="1" fill={c} />
          <rect x="38" y="0" width="22" height="80" fill={c} />
          <rect x="41" y="8" width="16" height="2.5" rx="1" fill="#fff" opacity="0.9" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x="41" y={14 + i * 5} width="14" height="2" rx="1" fill="#fff" opacity="0.5" />
          ))}
          <rect x="41" y="34" width="16" height="2.5" rx="1" fill="#fff" opacity="0.9" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="41" y={40 + i * 5} width="10" height="2.5" rx="1.5" fill="#fff" opacity="0.4" />
          ))}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="8" y={22 + i * 16} width="12" height="3" rx="1" fill={t} />
              <rect x="8" y={27 + i * 16} width="26" height="2" rx="1" fill={t} opacity="0.5" />
              <rect x="8" y={31 + i * 16} width="20" height="2" rx="1" fill={t} opacity="0.35" />
            </g>
          ))}
        </>
      )}
      {id === 'latex' && (
        <>
          <rect x="18" y="7" width="24" height="5" rx="1" fill={t} />
          <rect x="14" y="15" width="32" height="2" rx="1" fill={t} opacity="0.5" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="8" y={23 + i * 17} width="10" height="2.5" rx="1" fill={t} />
              <rect x="8" y={26.5 + i * 17} width="44" height="1.5" fill={t} opacity="0.6" />
              <rect x="8" y={30.5 + i * 17} width="40" height="2" rx="1" fill={t} opacity="0.45" />
              <rect x="8" y={34 + i * 17} width="34" height="2" rx="1" fill={t} opacity="0.3" />
            </g>
          ))}
        </>
      )}
      {id === 'executive' && (
        <>
          <rect x="10" y="8" width="34" height="7" rx="1" fill={t} />
          <rect x="10" y="18" width="18" height="3" rx="1" fill={c} />
          <rect x="10" y="25" width="40" height="2" rx="1" fill={t} opacity="0.4" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="10" y={33 + i * 14} width="8" height="2.5" rx="1" fill={t} />
              <rect x="10" y={37 + i * 14} width="40" height="1" fill={t} opacity="0.5" />
              <rect x="10" y={40.5 + i * 14} width="36" height="2" rx="1" fill={t} opacity="0.4" />
            </g>
          ))}
        </>
      )}
      {id === 'banner' && (
        <>
          <rect x="0" y="0" width="60" height="20" fill={c} />
          <rect x="8" y="7" width="22" height="4" rx="1" fill="#fff" />
          <rect x="34" y="8" width="18" height="2" rx="1" fill="#fff" opacity="0.7" />
          <rect x="38" y="12" width="14" height="2" rx="1" fill="#fff" opacity="0.7" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="8" y={26 + i * 16} width="12" height="3" rx="1" fill={t} />
              <rect x="8" y={31 + i * 16} width="28" height="2" rx="1" fill={t} opacity="0.5" />
              <rect x="8" y={35 + i * 16} width="22" height="2" rx="1" fill={t} opacity="0.35" />
            </g>
          ))}
          <rect x="41" y="22" width="1" height="56" fill={t} opacity="0.3" />
          <rect x="45" y="26" width="8" height="2.5" rx="1" fill={c} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="45" y={32 + i * 5} width="11" height="2.5" rx="1.5" fill={c} opacity="0.4" />
          ))}
        </>
      )}
      {id === 'timeline' && (
        <>
          <rect x="0" y="0" width="60" height="16" fill={c} />
          <rect x="24" y="6" width="22" height="4" rx="1" fill="#fff" />
          <rect x="0" y="16" width="19" height="64" fill={t} opacity="0.18" />
          <rect x="3" y="22" width="10" height="2.5" rx="1" fill={t} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="3" y={28 + i * 6} width="2" height="2" rx="1" fill={t} opacity="0.6" />
              <rect x="6.5" y={28 + i * 6} width="11" height="2" rx="1" fill={t} opacity="0.5" />
            </g>
          ))}
          <rect x="26.5" y="20" width="1" height="54" fill={t} opacity="0.4" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle cx="27" cy={24 + i * 18} r="3" fill={c} />
              <rect x="33" y={22.5 + i * 18} width="10" height="2.5" rx="1" fill={t} />
              <rect x="33" y={27 + i * 18} width="20" height="2" rx="1" fill={t} opacity="0.5" />
              <rect x="33" y={31 + i * 18} width="15" height="2" rx="1" fill={t} opacity="0.35" />
            </g>
          ))}
        </>
      )}
    </svg>
  )
}
