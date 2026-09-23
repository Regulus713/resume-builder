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
}

export interface ResumeData {
  personal: PersonalInfo
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: string[]
  languages: string[]
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

export interface DesignOptions {
  template: TemplateId
  accentColor: string
  font: FontId
  fontSize: FontSize
  pageSize: PageSize
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

export type SectionKind = 'experience' | 'education' | 'skills'

/** Sidebar target to reveal after adding from the preview. */
export type FocusTarget = {
  kind: SectionKind
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
