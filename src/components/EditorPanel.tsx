import { useEffect } from 'react'
import type {
  EducationItem,
  ExperienceItem,
  FocusTarget,
  ResumeData,
} from '../types'
import { AddButton, ItemCard, Section, TextAreaField, TextField } from './ui'

interface EditorProps {
  resume: ResumeData
  onChange: (r: ResumeData) => void
  /** Set when the preview adds an entry — the sidebar reveals it. */
  focusTarget?: FocusTarget
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

export default function EditorPanel({ resume, onChange, focusTarget }: EditorProps) {
  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    onChange({ ...resume, [key]: value })

  // When the preview adds an entry, reveal it here: open the section,
  // scroll to the new card and focus its first input.
  useEffect(() => {
    if (!focusTarget) return
    const item = focusTarget.id
      ? document.getElementById(`panel-item-${focusTarget.id}`)
      : null
    const section = document.querySelector<HTMLElement>(
      `[data-section="${focusTarget.kind}"]`,
    )
    const target = item ?? section
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (item) {
      item
        .querySelector<HTMLElement>('input, textarea')
        ?.focus({ preventScroll: true })
    }
  }, [focusTarget])

  const setPersonal = (key: keyof ResumeData['personal'], value: string) =>
    set('personal', { ...resume.personal, [key]: value })

  const updateExperience = (id: string, patch: Partial<ExperienceItem>) =>
    set(
      'experience',
      resume.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    )

  const updateEducation = (id: string, patch: Partial<EducationItem>) =>
    set(
      'education',
      resume.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    )

  return (
    <div>
      <Section title="Personal details" defaultOpen>
        <TextField
          label="Full name"
          value={resume.personal.fullName}
          onChange={(v) => setPersonal('fullName', v)}
          placeholder="Alex Morgan"
        />
        <TextField
          label="Job title"
          value={resume.personal.jobTitle}
          onChange={(v) => setPersonal('jobTitle', v)}
          placeholder="Senior Software Engineer"
        />
        <div className="grid grid-cols-2 gap-2.5">
          <TextField
            label="Email"
            value={resume.personal.email}
            onChange={(v) => setPersonal('email', v)}
            placeholder="alex@email.com"
          />
          <TextField
            label="Phone"
            value={resume.personal.phone}
            onChange={(v) => setPersonal('phone', v)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <TextField
          label="Location"
          value={resume.personal.location}
          onChange={(v) => setPersonal('location', v)}
          placeholder="San Francisco, CA"
        />
        <div className="grid grid-cols-2 gap-2.5">
          <TextField
            label="Website"
            value={resume.personal.website}
            onChange={(v) => setPersonal('website', v)}
            placeholder="yoursite.dev"
          />
          <TextField
            label="LinkedIn"
            value={resume.personal.linkedin}
            onChange={(v) => setPersonal('linkedin', v)}
            placeholder="linkedin.com/in/you"
          />
        </div>
      </Section>

      <Section title="Summary">
        <TextAreaField
          label="Professional summary"
          value={resume.summary}
          onChange={(v) => set('summary', v)}
          placeholder="A short paragraph about who you are and what you do."
          rows={5}
        />
      </Section>

      <Section
        title="Experience"
        dataSection="experience"
        openSignal={
          focusTarget?.kind === 'experience' ? focusTarget.id : undefined
        }
      >
        {resume.experience.map((exp, i) => (
          <ItemCard
            key={exp.id}
            id={exp.id}
            flash={focusTarget?.id === exp.id}
            title={exp.role || exp.company || `Position ${i + 1}`}
            onRemove={() =>
              set(
                'experience',
                resume.experience.filter((e) => e.id !== exp.id),
              )
            }
            onMoveUp={() => set('experience', move(resume.experience, i, i - 1))}
            onMoveDown={() => set('experience', move(resume.experience, i, i + 1))}
            canMoveUp={i > 0}
            canMoveDown={i < resume.experience.length - 1}
          >
            <div className="grid grid-cols-2 gap-2.5">
              <TextField
                label="Role"
                value={exp.role}
                onChange={(v) => updateExperience(exp.id, { role: v })}
                placeholder="Software Engineer"
              />
              <TextField
                label="Company"
                value={exp.company}
                onChange={(v) => updateExperience(exp.id, { company: v })}
                placeholder="Acme Inc."
              />
            </div>
            <TextField
              label="Location"
              value={exp.location}
              onChange={(v) => updateExperience(exp.id, { location: v })}
              placeholder="City, ST or Remote"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <TextField
                label="Start"
                value={exp.startDate}
                onChange={(v) => updateExperience(exp.id, { startDate: v })}
                placeholder="Mar 2021"
              />
              <TextField
                label="End"
                value={exp.endDate}
                onChange={(v) => updateExperience(exp.id, { endDate: v })}
                placeholder="Feb 2023"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-neutral-600">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-neutral-300 accent-blue-600"
                checked={exp.current}
                onChange={(e) =>
                  updateExperience(exp.id, { current: e.target.checked })
                }
              />
              I currently work here
            </label>
            <TextAreaField
              label="Description"
              value={exp.description}
              onChange={(v) => updateExperience(exp.id, { description: v })}
              placeholder="What you accomplished, one bullet per line"
              hint="Each line becomes a bullet point."
              rows={4}
            />
          </ItemCard>
        ))}
        <AddButton
          label="Add position"
          onClick={() =>
            set('experience', [
              ...resume.experience,
              {
                id: crypto.randomUUID(),
                role: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: '',
              },
            ])
          }
        />
      </Section>

      <Section
        title="Education"
        dataSection="education"
        openSignal={
          focusTarget?.kind === 'education' ? focusTarget.id : undefined
        }
      >
        {resume.education.map((edu, i) => (
          <ItemCard
            key={edu.id}
            id={edu.id}
            flash={focusTarget?.id === edu.id}
            title={edu.degree || edu.school || `Education ${i + 1}`}
            onRemove={() =>
              set(
                'education',
                resume.education.filter((e) => e.id !== edu.id),
              )
            }
            onMoveUp={() => set('education', move(resume.education, i, i - 1))}
            onMoveDown={() => set('education', move(resume.education, i, i + 1))}
            canMoveUp={i > 0}
            canMoveDown={i < resume.education.length - 1}
          >
            <div className="grid grid-cols-2 gap-2.5">
              <TextField
                label="Degree"
                value={edu.degree}
                onChange={(v) => updateEducation(edu.id, { degree: v })}
                placeholder="B.S. Computer Science"
              />
              <TextField
                label="School"
                value={edu.school}
                onChange={(v) => updateEducation(edu.id, { school: v })}
                placeholder="University name"
              />
            </div>
            <TextField
              label="Location"
              value={edu.location}
              onChange={(v) => updateEducation(edu.id, { location: v })}
              placeholder="City, ST"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <TextField
                label="Start"
                value={edu.startDate}
                onChange={(v) => updateEducation(edu.id, { startDate: v })}
                placeholder="2012"
              />
              <TextField
                label="End"
                value={edu.endDate}
                onChange={(v) => updateEducation(edu.id, { endDate: v })}
                placeholder="2016"
              />
            </div>
            <TextAreaField
              label="Notes"
              value={edu.description}
              onChange={(v) => updateEducation(edu.id, { description: v })}
              placeholder="Honors, coursework, GPA (optional)"
              rows={2}
            />
          </ItemCard>
        ))}
        <AddButton
          label="Add education"
          onClick={() =>
            set('education', [
              ...resume.education,
              {
                id: crypto.randomUUID(),
                degree: '',
                school: '',
                location: '',
                startDate: '',
                endDate: '',
                description: '',
              },
            ])
          }
        />
      </Section>

      <Section
        title="Skills"
        dataSection="skills"
        openSignal={focusTarget?.kind === 'skills' ? focusTarget : undefined}
      >
        <TextAreaField
          label="Skills"
          value={resume.skills.join('\n')}
          onChange={(v) =>
            set(
              'skills',
              v
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder={'TypeScript\nReact\nNode.js'}
          hint="One skill per line."
          rows={6}
        />
      </Section>

      <Section title="Languages" dataSection="languages">
        <TextAreaField
          label="Languages"
          value={(resume.languages ?? []).join('\n')}
          onChange={(v) =>
            set(
              'languages',
              v
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder={'English (Fluent)\nFrench (Intermediate)'}
          hint="One per line. Shown in the Timeline template's rail."
          rows={3}
        />
      </Section>
    </div>
  )
}
