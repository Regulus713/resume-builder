import type { BuiltinSectionId, CustomSectionType, SectionColumn } from '../types'
import type { UiIconName } from './ui'

export const SECTION_TYPES: {
  id: CustomSectionType
  label: string
  icon: UiIconName
}[] = [
  { id: 'tags', label: 'Tags', icon: 'tag' },
  { id: 'bullets', label: 'Bullets', icon: 'list' },
  { id: 'entries', label: 'Entries', icon: 'rows' },
  { id: 'text', label: 'Text', icon: 'quote' },
]

export const TYPE_ICON = Object.fromEntries(
  SECTION_TYPES.map((t) => [t.id, t.icon]),
) as Record<CustomSectionType, UiIconName>

export const COLUMNS: { id: SectionColumn; label: string }[] = [
  { id: 'main', label: 'Main column' },
  { id: 'side', label: 'Side column' },
]

export const SECTION_PRESETS: {
  title: string
  type: CustomSectionType
  column: SectionColumn
  icon: UiIconName
  /** Picker label when it differs from the section title. */
  label?: string
}[] = [
  { title: 'Projects', type: 'entries', column: 'main', icon: 'folder' },
  { title: 'Certifications', type: 'bullets', column: 'main', icon: 'award' },
  { title: 'Awards', type: 'bullets', column: 'main', icon: 'star' },
  { title: 'Volunteering', type: 'entries', column: 'main', icon: 'heart' },
  { title: 'Publications', type: 'bullets', column: 'main', icon: 'book' },
  { title: 'Tools', type: 'tags', column: 'side', icon: 'tag' },
  { title: 'Interests', type: 'tags', column: 'side', icon: 'sparkles' },
  { title: 'References', type: 'text', column: 'main', icon: 'quote' },
  { title: 'New section', type: 'bullets', column: 'main', icon: 'plus', label: 'Blank' },
]

/** Generic names for built-in sections (templates may use their own default, e.g. "Profile"). */
export const BUILTIN_NAMES: Record<BuiltinSectionId, string> = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  languages: 'Languages',
}

/** Quick-add labels for custom contact fields. */
export const FIELD_SUGGESTIONS = [
  'GitHub',
  'Portfolio',
  'X / Twitter',
  'Facebook',
  'Instagram',
  'YouTube',
  'Behance',
  'Dribbble',
  'Medium',
  'Stack Overflow',
  'WhatsApp',
  'Telegram',
]
