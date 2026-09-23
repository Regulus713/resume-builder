import type { ResumeData, SectionKind } from '../../types'
import { EditableLines, EditableText } from './Editable'
import { AddRow } from './shared'
import { contactItems, endDatePatch, updaters } from './utils'

interface Props {
  resume: ResumeData
  onChange: (r: ResumeData) => void
  onAdd: (section: SectionKind) => void
}

function ElegantHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-[1em]">
      <span className="h-px flex-1 bg-(--accent) opacity-30" />
      <h2 className="text-[0.7em] font-semibold tracking-[0.28em] uppercase text-(--accent)">
        {title}
      </h2>
      <span className="h-px flex-1 bg-(--accent) opacity-30" />
    </div>
  )
}

export default function ElegantTemplate({ resume, onChange, onAdd }: Props) {
  const { personal: p } = resume
  const contacts = contactItems(p)
  const up = updaters(resume, onChange)

  return (
    <div className="px-[16mm] py-[15mm] text-neutral-800">
      <header className="text-center">
        <EditableText
          as="h1"
          value={p.fullName}
          onChange={up.personal('fullName')}
          placeholder="Your name"
          className="block text-[2em] leading-tight font-semibold tracking-wide text-neutral-900"
        />
        <EditableText
          value={p.jobTitle}
          onChange={up.personal('jobTitle')}
          placeholder="Job title"
          className={`mt-[0.4em] block text-[0.72em] font-medium tracking-[0.3em] uppercase text-(--accent) ${
            p.jobTitle ? '' : 'print:hidden'
          }`}
        />
        <div
          className={`mt-[0.9em] flex flex-wrap justify-center gap-x-[1em] gap-y-[0.25em] text-[0.75em] text-neutral-500 ${
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
        <div className="mt-[1.1em] border-b-[3px] border-double border-(--accent)/40" />
      </header>

      <section className={`mt-[1.3em] ${resume.summary ? '' : 'print:hidden'}`}>
        <ElegantHeading title="Profile" />
        <EditableText
          as="p"
          multiline
          value={resume.summary}
          onChange={(v) => up.set('summary', v)}
          placeholder="Write a short professional summary…"
          className="mt-[0.7em] block text-center text-[0.86em] leading-relaxed whitespace-pre-line text-neutral-700"
        />
      </section>

      <section className={`mt-[1.3em] ${resume.experience.length ? '' : 'print:hidden'}`}>
        <ElegantHeading title="Experience" />
        <div className="mt-[0.8em]">
          {resume.experience.map((exp) => {
            const set = up.exp(exp.id)
            const end = exp.current ? 'Present' : exp.endDate
            return (
              <div key={exp.id} className="mb-[1.1em] break-inside-avoid last:mb-0">
                <div className="flex items-baseline justify-between gap-[1em]">
                  <div className="text-[0.92em]">
                    <EditableText
                      value={exp.role}
                      onChange={(v) => set({ role: v })}
                      placeholder="Role"
                      className="font-semibold"
                    />
                    <EditableText
                      value={exp.company}
                      onChange={(v) => set({ company: v })}
                      placeholder=" · Company"
                      className="italic"
                    />
                    <EditableText
                      value={exp.location}
                      onChange={(v) => set({ location: v })}
                      placeholder=", Location"
                      className={`text-[0.85em] text-neutral-500 ${
                        exp.location ? '' : 'print:hidden'
                      }`}
                    />
                  </div>
                  <div className="shrink-0 text-[0.72em] tracking-[0.08em] text-neutral-500 uppercase">
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
                <EditableLines
                  lines={exp.description ? exp.description.split('\n') : []}
                  onChange={(lines) => set({ description: lines.join('\n') })}
                  className="mt-[0.35em] list-disc space-y-[0.15em] pl-[1.3em] text-[0.83em] leading-relaxed text-neutral-600 marker:text-(--accent) marker:opacity-50"
                  placeholder="Add a bullet point"
                />
              </div>
            )
          })}
          <AddRow label="Add position" onClick={() => onAdd('experience')} />
        </div>
      </section>

      <section className={`mt-[1.3em] ${resume.education.length ? '' : 'print:hidden'}`}>
        <ElegantHeading title="Education" />
        <div className="mt-[0.8em]">
          {resume.education.map((edu) => {
            const set = up.edu(edu.id)
            return (
              <div key={edu.id} className="mb-[0.9em] break-inside-avoid last:mb-0">
                <div className="flex items-baseline justify-between gap-[1em]">
                  <div className="text-[0.92em]">
                    <EditableText
                      value={edu.degree}
                      onChange={(v) => set({ degree: v })}
                      placeholder="Degree"
                      className="font-semibold"
                    />
                    <EditableText
                      value={edu.school}
                      onChange={(v) => set({ school: v })}
                      placeholder=" · School"
                      className="italic"
                    />
                    <EditableText
                      value={edu.location}
                      onChange={(v) => set({ location: v })}
                      placeholder=", Location"
                      className={`text-[0.85em] text-neutral-500 ${
                        edu.location ? '' : 'print:hidden'
                      }`}
                    />
                  </div>
                  <div className="shrink-0 text-[0.72em] tracking-[0.08em] text-neutral-500 uppercase">
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
                  className={`mt-[0.2em] block text-[0.8em] whitespace-pre-line text-neutral-600 ${
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
        className={`mt-[1.3em] break-inside-avoid ${resume.skills.length ? '' : 'print:hidden'}`}
      >
        <ElegantHeading title="Skills" />
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
          className="mt-[0.7em] block text-center text-[0.83em] leading-relaxed whitespace-pre-line text-neutral-600"
        />
      </section>
    </div>
  )
}
