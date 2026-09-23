import type { ResumeData, SectionKind } from '../../types'
import { EditableLines, EditableText } from './Editable'
import { AddRow } from './shared'
import { contactItems, endDatePatch, updaters } from './utils'

interface Props {
  resume: ResumeData
  onChange: (r: ResumeData) => void
  onAdd: (section: SectionKind) => void
}

function CompactHeading({ title }: { title: string }) {
  return (
    <h2 className="flex items-center gap-[0.8em] text-[0.7em] font-bold tracking-[0.14em] uppercase text-(--accent)">
      {title}
      <span className="h-px flex-1 bg-(--accent) opacity-30" />
    </h2>
  )
}

export default function CompactTemplate({ resume, onChange, onAdd }: Props) {
  const { personal: p } = resume
  const contacts = contactItems(p)
  const up = updaters(resume, onChange)

  return (
    <div className="px-[12mm] py-[10mm] text-neutral-800">
      <header className="flex flex-wrap items-end justify-between gap-x-[1.5em] gap-y-[0.4em] border-b-2 border-(--accent) pb-[0.7em]">
        <div>
          <EditableText
            as="h1"
            value={p.fullName}
            onChange={up.personal('fullName')}
            placeholder="Your name"
            className="inline text-[1.7em] leading-tight font-bold tracking-tight text-neutral-900"
          />
          <EditableText
            value={p.jobTitle}
            onChange={up.personal('jobTitle')}
            placeholder="Job title"
            className={`ml-[0.6em] text-[0.95em] font-medium text-neutral-500 ${
              p.jobTitle ? '' : 'print:hidden'
            }`}
          />
        </div>
        <div
          className={`flex flex-wrap justify-end gap-x-[1em] gap-y-[0.15em] text-[0.7em] text-neutral-500 ${
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

      <section className={`mt-[1em] ${resume.summary ? '' : 'print:hidden'}`}>
        <EditableText
          as="p"
          multiline
          value={resume.summary}
          onChange={(v) => up.set('summary', v)}
          placeholder="Write a short professional summary…"
          className="block text-[0.82em] leading-snug whitespace-pre-line text-neutral-700"
        />
      </section>

      <section className={`mt-[1em] ${resume.experience.length ? '' : 'print:hidden'}`}>
        <CompactHeading title="Experience" />
        <div className="mt-[0.5em]">
          {resume.experience.map((exp) => {
            const set = up.exp(exp.id)
            const end = exp.current ? 'Present' : exp.endDate
            return (
              <div key={exp.id} className="mb-[0.8em] break-inside-avoid last:mb-0">
                <div className="flex items-baseline justify-between gap-[1em]">
                  <div className="text-[0.88em]">
                    <EditableText
                      value={exp.role}
                      onChange={(v) => set({ role: v })}
                      placeholder="Role"
                      className="font-semibold"
                    />
                    <EditableText
                      value={exp.company}
                      onChange={(v) => set({ company: v })}
                      placeholder=" — Company"
                      className="text-(--accent)"
                    />
                    <EditableText
                      value={exp.location}
                      onChange={(v) => set({ location: v })}
                      placeholder=", Location"
                      className={`text-neutral-500 ${exp.location ? '' : 'print:hidden'}`}
                    />
                  </div>
                  <div className="shrink-0 text-[0.7em] text-neutral-500">
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
                  className="mt-[0.2em] list-disc space-y-[0.05em] pl-[1.2em] text-[0.8em] leading-snug text-neutral-600 marker:text-neutral-400"
                  placeholder="Add a bullet point"
                />
              </div>
            )
          })}
          <AddRow label="Add position" onClick={() => onAdd('experience')} />
        </div>
      </section>

      <section className={`mt-[1em] ${resume.education.length ? '' : 'print:hidden'}`}>
        <CompactHeading title="Education" />
        <div className="mt-[0.5em]">
          {resume.education.map((edu) => {
            const set = up.edu(edu.id)
            return (
              <div key={edu.id} className="mb-[0.5em] break-inside-avoid last:mb-0">
                <div className="flex items-baseline justify-between gap-[1em]">
                  <div className="text-[0.85em]">
                    <EditableText
                      value={edu.degree}
                      onChange={(v) => set({ degree: v })}
                      placeholder="Degree"
                      className="font-semibold"
                    />
                    <EditableText
                      value={edu.school}
                      onChange={(v) => set({ school: v })}
                      placeholder=" — School"
                      className="text-(--accent)"
                    />
                    <EditableText
                      value={edu.location}
                      onChange={(v) => set({ location: v })}
                      placeholder=", Location"
                      className={`text-neutral-500 ${edu.location ? '' : 'print:hidden'}`}
                    />
                  </div>
                  <div className="shrink-0 text-[0.7em] text-neutral-500">
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
                  placeholder="Notes…"
                  className={`block text-[0.78em] whitespace-pre-line text-neutral-500 ${
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
        className={`mt-[1em] break-inside-avoid ${resume.skills.length ? '' : 'print:hidden'}`}
      >
        <CompactHeading title="Skills" />
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
          className="mt-[0.4em] block text-[0.8em] leading-snug whitespace-pre-line text-neutral-600"
        />
      </section>
    </div>
  )
}
