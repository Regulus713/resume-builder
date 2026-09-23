import type { ResumeData, SectionKind } from '../../types'
import { EditableLines, EditableText } from './Editable'
import { AddRow, SectionHeading } from './shared'
import { contactItems, endDatePatch, updaters } from './utils'

interface Props {
  resume: ResumeData
  onChange: (r: ResumeData) => void
  onAdd: (section: SectionKind) => void
}

export default function ClassicTemplate({ resume, onChange, onAdd }: Props) {
  const { personal: p } = resume
  const contacts = contactItems(p)
  const up = updaters(resume, onChange)

  return (
    <div className="px-[16mm] py-[14mm] text-neutral-800">
      <header className="text-center">
        <EditableText
          as="h1"
          value={p.fullName}
          onChange={up.personal('fullName')}
          placeholder="Your name"
          className="block text-[2.1em] leading-tight font-bold tracking-tight text-neutral-900"
        />
        <EditableText
          value={p.jobTitle}
          onChange={up.personal('jobTitle')}
          placeholder="Job title"
          className={`mt-[0.2em] block text-[1.1em] font-medium text-(--accent) ${
            p.jobTitle ? '' : 'print:hidden'
          }`}
        />
        <div
          className={`mt-[0.8em] flex flex-wrap justify-center gap-x-[1.1em] gap-y-[0.25em] text-[0.78em] text-neutral-500 ${
            contacts.some((c) => c.text.trim()) ? '' : 'print:hidden'
          }`}
        >
          {contacts.map((c) => (
            <EditableText
              key={c.field}
              value={c.text}
              onChange={up.personal(c.field)}
              placeholder={c.placeholder}
              className={c.text.trim() ? '' : 'print:hidden'}
            />
          ))}
        </div>
      </header>

      <section className={`mt-[1.5em] ${resume.summary ? '' : 'print:hidden'}`}>
        <SectionHeading title="Summary" className="text-(--accent)" />
        <div className="mt-[0.4em] h-px w-full bg-(--accent) opacity-25" />
        <EditableText
          as="p"
          multiline
          value={resume.summary}
          onChange={(v) => up.set('summary', v)}
          placeholder="Write a short professional summary…"
          className="mt-[0.6em] block text-[0.88em] leading-relaxed whitespace-pre-line"
        />
      </section>

      <section
        className={`mt-[1.5em] ${resume.experience.length ? '' : 'print:hidden'}`}
      >
        <SectionHeading title="Experience" className="text-(--accent)" />
        <div className="mt-[0.4em] h-px w-full bg-(--accent) opacity-25" />
        <div className="mt-[0.7em]">
          {resume.experience.map((exp) => {
            const set = up.exp(exp.id)
            const end = exp.current ? 'Present' : exp.endDate
            return (
              <div key={exp.id} className="mb-[1.1em] break-inside-avoid last:mb-0">
                <div className="flex items-baseline justify-between gap-[1em]">
                  <div className="text-[0.95em] font-semibold">
                    <EditableText
                      value={exp.role}
                      onChange={(v) => set({ role: v })}
                      placeholder="Role"
                    />
                    <EditableText
                      value={exp.company}
                      onChange={(v) => set({ company: v })}
                      placeholder=" · Company"
                      className="font-medium text-(--accent)"
                    />
                  </div>
                  <div className="shrink-0 text-[0.75em] text-neutral-500">
                    <EditableText
                      value={exp.startDate}
                      onChange={(v) => set({ startDate: v })}
                      placeholder="Start"
                    />
                    {exp.startDate || end ? ' – ' : ' '}
                    <EditableText
                      value={end}
                      onChange={(v) => set(endDatePatch(v))}
                      placeholder="End"
                    />
                  </div>
                </div>
                <EditableText
                  value={exp.location}
                  onChange={(v) => set({ location: v })}
                  placeholder="Location"
                  className={`block text-[0.78em] text-neutral-500 italic ${
                    exp.location ? '' : 'print:hidden'
                  }`}
                />
                <EditableLines
                  lines={exp.description ? exp.description.split('\n') : []}
                  onChange={(lines) => set({ description: lines.join('\n') })}
                  className="mt-[0.35em] list-disc space-y-[0.15em] pl-[1.3em] text-[0.85em] leading-relaxed text-neutral-600 marker:text-neutral-400"
                  placeholder="Add a bullet point"
                />
              </div>
            )
          })}
          <AddRow label="Add position" onClick={() => onAdd('experience')} />
        </div>
      </section>

      <section
        className={`mt-[1.5em] ${resume.education.length ? '' : 'print:hidden'}`}
      >
        <SectionHeading title="Education" className="text-(--accent)" />
        <div className="mt-[0.4em] h-px w-full bg-(--accent) opacity-25" />
        <div className="mt-[0.7em]">
          {resume.education.map((edu) => {
            const set = up.edu(edu.id)
            return (
              <div key={edu.id} className="mb-[0.9em] break-inside-avoid last:mb-0">
                <div className="flex items-baseline justify-between gap-[1em]">
                  <div className="text-[0.95em] font-semibold">
                    <EditableText
                      value={edu.degree}
                      onChange={(v) => set({ degree: v })}
                      placeholder="Degree"
                    />
                    <EditableText
                      value={edu.school}
                      onChange={(v) => set({ school: v })}
                      placeholder=" · School"
                      className="font-medium text-(--accent)"
                    />
                  </div>
                  <div className="shrink-0 text-[0.75em] text-neutral-500">
                    <EditableText
                      value={edu.startDate}
                      onChange={(v) => set({ startDate: v })}
                      placeholder="Start"
                    />
                    {edu.startDate || edu.endDate ? ' – ' : ' '}
                    <EditableText
                      value={edu.endDate}
                      onChange={(v) => set({ endDate: v })}
                      placeholder="End"
                    />
                  </div>
                </div>
                <EditableText
                  as="p"
                  multiline
                  value={edu.description}
                  onChange={(v) => set({ description: v })}
                  placeholder="Honors, coursework, GPA…"
                  className={`mt-[0.2em] block text-[0.82em] whitespace-pre-line text-neutral-600 ${
                    edu.description ? '' : 'print:hidden'
                  }`}
                />
              </div>
            )
          })}
          <AddRow label="Add education" onClick={() => onAdd('education')} />
        </div>
      </section>

      <section
        className={`mt-[1.5em] break-inside-avoid ${resume.skills.length ? '' : 'print:hidden'}`}
      >
        <SectionHeading title="Skills" className="text-(--accent)" />
        <div className="mt-[0.4em] h-px w-full bg-(--accent) opacity-25" />
        <EditableText
          as="p"
          multiline
          value={resume.skills.join(' · ')}
          onChange={(v) =>
            up.set(
              'skills',
              v
                .split(/[·,\n]+/)
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder="TypeScript · React · Node.js…"
          className="mt-[0.6em] block text-[0.88em] leading-relaxed whitespace-pre-line"
        />
      </section>
    </div>
  )
}
