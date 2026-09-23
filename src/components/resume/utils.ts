import type {
  EducationItem,
  ExperienceItem,
  PersonalInfo,
  ResumeData,
} from '../../types'

export type ContactIcon = 'mail' | 'phone' | 'pin' | 'globe' | 'link'
export type SectionIcon = 'user' | 'case' | 'cap'
export type IconName = ContactIcon | SectionIcon

export function formatRange(start: string, end: string, current?: boolean): string {
  const s = start.trim()
  const e = current ? 'Present' : end.trim()
  if (s && e) return `${s} – ${e}`
  return s || e
}

export interface ContactItem {
  icon: ContactIcon
  field: keyof PersonalInfo
  text: string
  placeholder: string
}

/** All contact fields — empty ones render as ghosts on screen, hidden in print. */
export function contactItems(p: PersonalInfo): ContactItem[] {
  return [
    { icon: 'mail', field: 'email', text: p.email, placeholder: 'Email' },
    { icon: 'phone', field: 'phone', text: p.phone, placeholder: 'Phone' },
    { icon: 'pin', field: 'location', text: p.location, placeholder: 'Location' },
    { icon: 'globe', field: 'website', text: p.website, placeholder: 'Website' },
    { icon: 'link', field: 'linkedin', text: p.linkedin, placeholder: 'LinkedIn' },
  ]
}

/** Curried updaters so templates can bind fields to EditableText onChange. */
export function updaters(resume: ResumeData, onChange: (r: ResumeData) => void) {
  const set = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) =>
    onChange({ ...resume, [k]: v })
  return {
    set,
    personal:
      (k: keyof PersonalInfo) =>
      (v: string) =>
        set('personal', { ...resume.personal, [k]: v }),
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

/** Parse an edited "end date" — typing "present" keeps the current flag. */
export function endDatePatch(text: string): { current: boolean; endDate: string } {
  return /^\s*(present|current|now)\s*$/i.test(text)
    ? { current: true, endDate: '' }
    : { current: false, endDate: text }
}

export const ICON_PATHS: Record<IconName, string> = {
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
}
