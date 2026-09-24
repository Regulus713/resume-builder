export interface PersonalInfo {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
}

export interface ExperienceItem {
  id: string
  role: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface EducationItem {
  id: string
  degree: string
  school: string
  location: string
  startDate: string
  endDate: string
  description: string
  /** Progress 1–5 (0/undefined = not set), shown when a level style is chosen. */
  level?: number
}

/** How 1–5 levels are drawn; "none" shows plain text only. */
export type LevelStyle = 'none' | 'stars' | 'dots' | 'bar' | 'blocks' | 'text'
/** Built-in sections that support levels. */
export type LevelSection = 'skills' | 'languages' | 'education'
/** Built-in string lists whose items can carry levels. */
export type LevelListId = 'skills' | 'languages'

/** User-defined contact field shown next to email/phone (e.g. GitHub). */
export interface CustomField {
  id: string
  label: string
  value: string
}

export type CustomSectionType = 'tags' | 'bullets' | 'entries' | 'text'
/** Where a custom section goes in two-column templates. */
export type SectionColumn = 'main' | 'side'

export interface CustomEntry {
  id: string
  title: string
  subtitle: string
  date: string
  /** One bullet per line. */
  description: string
}

/**
 * A user-created section. Every content kind is stored side by side so
 * switching `type` is lossless; only the active kind is rendered.
 */
export interface CustomSection {
  id: string
  title: string
  type: CustomSectionType
  column: SectionColumn
  hidden: boolean
  items: string[]
  entries: CustomEntry[]
  text: string
  /** Level display for tag/bullet items (optional: older saves lack it). */
  levelStyle?: LevelStyle
  /** Item text → level 1–5. */
  levels?: Record<string, number>
}

export type BuiltinSectionId =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'

export interface ResumeData {
  personal: PersonalInfo
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: string[]
  languages: string[]
  customFields: CustomField[]
  customSections: CustomSection[]
  /** Heading overrides for built-in sections; empty/missing = template default. */
  sectionTitles: Partial<Record<BuiltinSectionId, string>>
  hiddenSections: BuiltinSectionId[]
  /**
   * Icon overrides per contact item, keyed by built-in field name (e.g.
   * "email") or custom field id. Missing = auto-detected from label/value.
   */
  contactIcons: Record<string, string>
  /** Per-list item levels 1–5, keyed by (trimmed) item text. */
  levels: Partial<Record<LevelListId, Record<string, number>>>
  /** Level display per section; missing = "none". */
  levelStyles: Partial<Record<LevelSection, LevelStyle>>
}

export type TemplateId =
  | 'classic'
  | 'sidebar'
  | 'modern'
  | 'minimal'
  | 'compact'
  | 'elegant'
  | 'rightrail'
  | 'latex'
  | 'executive'
  | 'banner'
  | 'timeline'
export type FontId = 'inter' | 'serif' | 'georgia' | 'mono'
export type FontSize = 'sm' | 'md' | 'lg'
export type PageSize = 'a4' | 'letter'
/** "template": only templates designed with icons show them. */
export type ContactIconMode = 'template' | 'show' | 'hide'

export interface DesignOptions {
  template: TemplateId
  accentColor: string
  font: FontId
  fontSize: FontSize
  pageSize: PageSize
  contactIcons: ContactIconMode
}

export const FONT_STACKS: Record<FontId, string> = {
  inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
  serif: "'Source Serif 4', Georgia, serif",
  georgia: "Georgia, 'Times New Roman', serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
}

export const FONT_LABELS: Record<FontId, string> = {
  inter: 'Inter',
  serif: 'Source Serif',
  georgia: 'Georgia',
  mono: 'JetBrains Mono',
}

export const FONT_SIZES: Record<FontSize, string> = {
  sm: '12.5px',
  md: '14px',
  lg: '15.5px',
}

export const PAGE_DIMS: Record<PageSize, { width: string; height: string }> = {
  a4: { width: '210mm', height: '297mm' },
  letter: { width: '8.5in', height: '11in' },
}

export type SectionKind = 'experience' | 'education' | 'skills' | 'custom'

/** Sidebar target to reveal after adding from the preview. */
export type FocusTarget = {
  kind: SectionKind
  /** Custom section id when `kind === 'custom'`. */
  sectionId?: string
  id?: string
} | null

export const ACCENT_PRESETS = [
  '#2563eb',
  '#0f766e',
  '#15803d',
  '#c2410c',
  '#b91c1c',
  '#9f1239',
  '#7c3aed',
  '#0f172a',
]
