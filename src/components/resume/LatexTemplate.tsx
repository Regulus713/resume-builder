import type { ResumeData, SectionKind } from '../../types'
import { EditableLines, EditableText } from './Editable'
import { AddRow } from './shared'
import { contactItems, endDatePatch, updaters } from './utils'

interface Props {
  resume: ResumeData
  onChange: (r: ResumeData) => void
  onAdd: (section: SectionKind) => void
}

function LatexHeading({ title }: { title: string }) {
  return (
    <h2 className="border-b border-neutral-800 pb-[0.15em] text-[0.85em] font-bold tracking-[0.12em] uppercase">
      {title}
    </h2>
  )
}

export default function LatexTemplate({ resume, onChange, onAdd }: Props) {
  const { personal: p } = resume
  const contacts = contactItems(p)
  const up = updaters(resume, onChange)

  return (
    <div className="px-[14mm] py-[12mm] text-neutral-900">
      <header className="text-center">
        <EditableText
          as="h1"
          value={p.fullName}
          onChange={up.personal('fullName')}
          placeholder="Your name"
          className="block text-[1.9em] leading-tight font-bold"
        />
        <EditableText
          value={p.jobTitle}
          onChange={up.personal('jobTitle')}
          placeholder="Job title"
          className={`mt-[0.15em] block text-[0.95em] ${
            p.jobTitle ? '' : 'print:hidden'
          }`}
        />
        <div
          className={`mt-[0.5em] flex flex-wrap justify-center gap-x-[0.2em] gap-y-[0.2em] text-[0.78em] ${
            contacts.some((c) => c.text.trim()) ? '' : 'print:hidden'
          }`}
        >
          {contacts.map((c, i) => (
            <span key={c.field} className={c.text.trim() ? '' : 'print:hidden'}>
              {i > 0 && <span className="mx-[0.45em] text-neutral-400">|</span>}
              <EditableText
                value={c.text}
                onChange={up.personal(c.field)}
                placeholder={c.placeholder}
              />
            </span>
          ))}
        </div>
      </header>

      <section className={`mt-[1.1em] ${resume.summary ? '' : 'print:hidden'}`}>
        <LatexHeading title="Summary" />
        <EditableText
          as="p"
          multiline
          value={resume.summary}
          onChange={(v) => up.set('summary', v)}
          placeholder="Write a short professional summary…"
          className="mt-[0.5em] block text-[0.85em] leading-relaxed whitespace-pre-line"
        />
      </section>

      <section className={`mt-[1.1em] ${resume.experience.length ? '' : 'print:hidden'}`}>
        <LatexHeading title="Experience" />
        <div className="mt-[0.5em]">
          {resume.experience.map((exp) => {
            const set = up.exp(exp.id)
            const end = exp.current ? 'Present' : exp.endDate
            return (
              <div key={exp.id} className="mb-[0.9em] break-inside-avoid last:mb-0">
                <div className="flex items-baseline justify-between gap-[1em]">
                  <EditableText
                    value={exp.role}
                    onChange={(v) => set({ role: v })}
                    placeholder="Role"
                    className="text-[0.88em] font-bold"
                  />
                  <span className="shrink-0 text-[0.8em] font-bold">
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
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-[1em] italic">
                  <EditableText
                    value={exp.company}
                    onChange={(v) => set({ company: v })}
                    placeholder="Company"
                    className="text-[0.85em]"
                  />
                  <EditableText
                    value={exp.location}
                    onChange={(v) => set({ location: v })}
                    placeholder="Location"
                    className={`shrink-0 text-[0.8em] ${exp.location ? '' : 'print:hidden'}`}
                  />
                </div>
                <EditableLines
                  lines={exp.description ? exp.description.split('\n') : []}
                  onChange={(lines) => set({ description: lines.join('\n') })}
                  className="mt-[0.3em] list-disc space-y-[0.1em] pl-[1.4em] text-[0.82em] leading-snug marker:text-neutral-500"
                  placeholder="Add a bullet point"
                />
              </div>
            )
          })}
          <AddRow label="Add position" onClick={() => onAdd('experience')} />
        </div>
      </section>

      <section className={`mt-[1.1em] ${resume.education.length ? '' : 'print:hidden'}`}>
        <LatexHeading title="Education" />
        <div className="mt-[0.5em]">
          {resume.education.map((edu) => {
            const set = up.edu(edu.id)
            return (
              <div key={edu.id} className="mb-[0.7em] break-inside-avoid last:mb-0">
                <div className="flex items-baseline justify-between gap-[1em]">
                  <EditableText
                    value={edu.school}
                    onChange={(v) => set({ school: v })}
                    placeholder="School"
                    className="text-[0.88em] font-bold"
                  />
                  <EditableText
                    value={edu.location}
                    onChange={(v) => set({ location: v })}
                    placeholder="Location"
                    className={`shrink-0 text-[0.8em] ${edu.location ? '' : 'print:hidden'}`}
                  />
                </div>
                <div className="flex items-baseline justify-between gap-[1em] italic">
                  <EditableText
                    value={edu.degree}
                    onChange={(v) => set({ degree: v })}
                    placeholder="Degree"
                    className="text-[0.85em]"
                  />
                  <span className="shrink-0 text-[0.8em] not-italic">
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
                  </span>
                </div>
                <EditableText
                  as="p"
                  multiline
                  value={edu.description}
                  onChange={(v) => set({ description: v })}
                  placeholder="Honors, coursework, GPA…"
                  className={`block text-[0.8em] whitespace-pre-line ${
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
        className={`mt-[1.1em] break-inside-avoid ${resume.skills.length ? '' : 'print:hidden'}`}
      >
        <LatexHeading title="Skills" />
        <EditableText
          as="p"
          multiline
          value={resume.skills.join(', ')}
          onChange={(v) =>
            up.set(
              'skills',
              v
                .split(/[·,\n]+/)
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder="TypeScript, React, Node.js…"
          className="mt-[0.5em] block text-[0.82em] leading-relaxed whitespace-pre-line"
        />
      </section>
    </div>
  )
}
