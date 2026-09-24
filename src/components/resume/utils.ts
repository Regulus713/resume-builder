import type {
  BuiltinSectionId,
  CustomEntry,
  CustomSection,
  CustomSectionType,
  EducationItem,
  ExperienceItem,
  LevelListId,
  LevelSection,
  LevelStyle,
  PersonalInfo,
  ResumeData,
  SectionColumn,
} from '../../types'
import { BRAND_ICONS, type BrandIcon } from './brandIcons'

export type GenericContactIcon = 'mail' | 'phone' | 'pin' | 'globe' | 'link'
export type ContactIcon = GenericContactIcon | BrandIcon
export type SectionIcon = 'user' | 'case' | 'cap' | 'star'
export type IconName = ContactIcon | SectionIcon

export const GENERIC_CONTACT_ICONS: { id: GenericContactIcon; title: string }[] = [
  { id: 'mail', title: 'Email' },
  { id: 'phone', title: 'Phone' },
  { id: 'pin', title: 'Location' },
  { id: 'globe', title: 'Website' },
  { id: 'link', title: 'Link' },
]

export function isBrandIcon(name: string): name is BrandIcon {
  return Object.hasOwn(BRAND_ICONS, name)
}

export function isContactIcon(name: string): name is ContactIcon {
  return isBrandIcon(name) || GENERIC_CONTACT_ICONS.some((g) => g.id === name)
}

export function iconTitle(name: ContactIcon): string {
  return isBrandIcon(name)
    ? BRAND_ICONS[name].title
    : (GENERIC_CONTACT_ICONS.find((g) => g.id === name)?.title ?? name)
}

/** First brand whose pattern matches the text (label or URL/handle). */
export function detectBrand(text: string): BrandIcon | undefined {
  const t = text.trim().toLowerCase()
  if (!t) return undefined
  return (Object.keys(BRAND_ICONS) as BrandIcon[]).find((k) => BRAND_ICONS[k].match.test(t))
}

const MAIL_BRANDS: BrandIcon[] = ['gmail', 'microsoftoutlook', 'protonmail']

/**
 * Icon picked automatically for a contact item. `key` is the built-in field
 * name or a custom field id.
 */
export function autoContactIcon(key: string, label: string, value: string): ContactIcon {
  switch (key) {
    case 'email': {
      const b = detectBrand(value)
      return b && MAIL_BRANDS.includes(b) ? b : 'mail'
    }
    case 'phone':
      return 'phone'
    case 'location':
      return 'pin'
    case 'website':
      return detectBrand(value) ?? 'globe'
    case 'linkedin':
      return 'linkedin'
  }
  return detectBrand(label) ?? detectBrand(value) ?? customFieldIcon(label)
}

/** User override if valid, else the auto-detected icon. */
export function contactIconFor(
  resume: ResumeData,
  key: string,
  label: string,
  value: string,
): ContactIcon {
  const override = resume.contactIcons[key]
  return override && isContactIcon(override) ? override : autoContactIcon(key, label, value)
}

export function formatRange(start: string, end: string, current?: boolean): string {
  const s = start.trim()
  const e = current ? 'Present' : end.trim()
  if (s && e) return `${s} – ${e}`
  return s || e
}

export interface ContactItem {
  key: string
  icon: ContactIcon
  text: string
  placeholder: string
  onChange: (v: string) => void
}

/** Generic icon for a user-defined contact field, from its label. */
function customFieldIcon(label: string): GenericContactIcon {
  const l = label.toLowerCase()
  if (/mail/.test(l)) return 'mail'
  if (/phone|mobile|tel/.test(l)) return 'phone'
  if (/site|web|portfolio|blog/.test(l)) return 'globe'
  if (/address|city|location/.test(l)) return 'pin'
  return 'link'
}

/**
 * All contact fields (built-in + custom) — empty ones render as ghosts on
 * screen, hidden in print.
 */
export function contactItems(
  resume: ResumeData,
  onChange: (r: ResumeData) => void,
): ContactItem[] {
  const up = updaters(resume, onChange)
  const p = resume.personal
  const builtin = (
    [
      ['email', 'Email'],
      ['phone', 'Phone'],
      ['location', 'Location'],
      ['website', 'Website'],
      ['linkedin', 'LinkedIn'],
    ] as const
  ).map(([field, placeholder]) => ({
    key: field,
    icon: contactIconFor(resume, field, placeholder, p[field]),
    text: p[field],
    placeholder,
    onChange: up.personal(field),
  }))
  const custom = resume.customFields.map((f) => ({
    key: f.id,
    icon: contactIconFor(resume, f.id, f.label, f.value),
    text: f.value,
    placeholder: f.label || 'Custom field',
    onChange: up.customField(f.id),
  }))
  return [...builtin, ...custom]
}

export const LEVEL_MAX = 5

export const LEVEL_LABELS = {
  generic: ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'],
  language: ['Basic', 'Conversational', 'Proficient', 'Fluent', 'Native'],
} as const
export type LevelLabelSet = keyof typeof LEVEL_LABELS

/** Word for a 1–5 level ('' when unset). */
export function levelLabel(level: number, set: LevelLabelSet): string {
  return level >= 1 ? (LEVEL_LABELS[set][Math.min(level, LEVEL_MAX) - 1] ?? '') : ''
}

/**
 * Keep item levels attached to their text through list edits: levels of
 * items that still exist are kept, an item edited in place (same list
 * length, text changed) carries its level to the new text, and levels of
 * removed items are dropped.
 */
export function remapLevels(
  prev: string[],
  next: string[],
  levels: Record<string, number> = {},
): Record<string, number> {
  const keys = new Set(next.map((s) => s.trim()))
  const out: Record<string, number> = {}
  for (const k of keys) if (levels[k]) out[k] = levels[k]
  if (prev.length === next.length) {
    prev.forEach((p, i) => {
      const from = p.trim()
      const to = next[i].trim()
      if (from !== to && levels[from] && !keys.has(from) && !out[to]) out[to] = levels[from]
    })
  }
  return out
}

/** Levels map with one item set (1–5) or cleared (0). */
export function withLevel(levels: Record<string, number> = {}, item: string, level: number) {
  const next = { ...levels }
  if (level >= 1) next[item.trim()] = Math.min(level, LEVEL_MAX)
  else delete next[item.trim()]
  return next
}

/** Curried updaters so templates can bind fields to EditableText onChange. */
export function updaters(resume: ResumeData, onChange: (r: ResumeData) => void) {
  const set = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) =>
    onChange({ ...resume, [k]: v })
  const custom = (id: string) => (patch: Partial<CustomSection>) =>
    set(
      'customSections',
      resume.customSections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    )
  /** Replace a built-in list (skills/languages), keeping item levels attached. */
  const list = (id: LevelListId) => (items: string[]) =>
    onChange({
      ...resume,
      [id]: items,
      levels: { ...resume.levels, [id]: remapLevels(resume[id], items, resume.levels[id]) },
    })
  const levelStyle = (section: LevelSection): LevelStyle => resume.levelStyles[section] ?? 'none'
  return {
    set,
    list,
    levelStyle,
    setLevelStyle: (section: LevelSection) => (style: LevelStyle) =>
      set('levelStyles', { ...resume.levelStyles, [section]: style }),
    /** Props for `<LevelList>` rendering a built-in list with levels. */
    levelList: (id: LevelListId) => ({
      items: resume[id],
      levels: resume.levels[id] ?? {},
      style: levelStyle(id),
      labels: (id === 'languages' ? 'language' : 'generic') as LevelLabelSet,
      onItems: list(id),
      onLevel: (item: string, level: number) =>
        set('levels', { ...resume.levels, [id]: withLevel(resume.levels[id], item, level) }),
    }),
    /** Props for `<EducationLevel>` on one education entry. */
    eduLevel: (edu: EducationItem) => ({
      value: edu.level ?? 0,
      style: levelStyle('education'),
      onChange: (level: number) =>
        set(
          'education',
          resume.education.map((e) => (e.id === edu.id ? { ...e, level } : e)),
        ),
    }),
    /** Replace a custom section's items, keeping item levels attached. */
    customItems: (id: string) => (items: string[]) => {
      const s = resume.customSections.find((x) => x.id === id)
      if (s) custom(id)({ items, levels: remapLevels(s.items, items, s.levels) })
    },
    /** Is a built-in section visible (not hidden by the user)? */
    shown: (id: BuiltinSectionId) => !resume.hiddenSections.includes(id),
    /** Props for an editable built-in heading; empty text falls back to the template default. */
    title: (id: BuiltinSectionId, fallback: string) => ({
      value: resume.sectionTitles[id] ?? '',
      fallback,
      onChange: (v: string) => {
        const next = { ...resume.sectionTitles }
        if (v.trim()) next[id] = v
        else delete next[id]
        set('sectionTitles', next)
      },
    }),
    personal:
      (k: keyof PersonalInfo) =>
      (v: string) =>
        set('personal', { ...resume.personal, [k]: v }),
    /** Set (or clear with `null` → auto) the icon of a contact item. */
    contactIcon: (key: string) => (icon: ContactIcon | null) => {
      const next = { ...resume.contactIcons }
      if (icon) next[key] = icon
      else delete next[key]
      set('contactIcons', next)
    },
    customField: (id: string) => (v: string) =>
      set(
        'customFields',
        resume.customFields.map((f) => (f.id === id ? { ...f, value: v } : f)),
      ),
    custom,
    customEntry: (sectionId: string, entryId: string) => (patch: Partial<CustomEntry>) => {
      const s = resume.customSections.find((x) => x.id === sectionId)
      if (!s) return
      custom(sectionId)({
        entries: s.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
      })
    },
    exp:
      (id: string) =>
      (patch: Partial<ExperienceItem>) =>
        set(
          'experience',
          resume.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        ),
    edu:
      (id: string) =>
      (patch: Partial<EducationItem>) =>
        set(
          'education',
          resume.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        ),
  }
}

export function blankExperience(id: string): ExperienceItem {
  return {
    id,
    role: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  }
}

export function blankEducation(id: string): EducationItem {
  return {
    id,
    degree: '',
    school: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
  }
}

export function blankCustomEntry(id: string): CustomEntry {
  return { id, title: '', subtitle: '', date: '', description: '' }
}

export function newCustomSection(
  title: string,
  type: CustomSectionType,
  column: SectionColumn,
): CustomSection {
  return {
    id: crypto.randomUUID(),
    title,
    type,
    column,
    hidden: false,
    items: [],
    entries: type === 'entries' ? [blankCustomEntry(crypto.randomUUID())] : [],
    text: '',
  }
}

export function entryHasContent(e: CustomEntry): boolean {
  return [e.title, e.subtitle, e.date, e.description].some((v) => v.trim())
}

/** Does the active content kind of a custom section have anything to print? */
export function customHasContent(s: CustomSection): boolean {
  switch (s.type) {
    case 'tags':
    case 'bullets':
      return s.items.some((i) => i.trim())
    case 'entries':
      return s.entries.some(entryHasContent)
    case 'text':
      return s.text.trim() !== ''
  }
}

/** Parse an edited "end date" — typing "present" keeps the current flag. */
export function endDatePatch(text: string): { current: boolean; endDate: string } {
  return /^\s*(present|current|now)\s*$/i.test(text)
    ? { current: true, endDate: '' }
    : { current: false, endDate: text }
}

export const ICON_PATHS: Record<GenericContactIcon | SectionIcon, string> = {
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone:
    'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
  pin: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
  globe:
    'M12 21a9 9 0 100-18 9 9 0 000 18z M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3M3.6 9h16.8M3.6 15h16.8',
  link: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
  user: 'M15.5 8a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5',
  case: 'M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7M3.5 7h17a1 1 0 011 1v10a1 1 0 01-1 1h-17a1 1 0 01-1-1V8a1 1 0 011-1zm0 5.5h17',
  cap: 'M12 4L2 8.5l10 4.5 10-4.5L12 4zM6 11.4V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.6M22 8.5V15',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
}
