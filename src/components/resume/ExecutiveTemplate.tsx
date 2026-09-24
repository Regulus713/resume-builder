import type { ReactNode } from 'react'
import type { ResumeData, SectionKind } from '../../types'
import CustomSections, { type CustomTheme } from './CustomSections'
import { EditableLines, EditableText } from './Editable'
import { EducationLevel, LevelList } from './Level'
import { AddRow, EditableHeading, OptionalContactIcon } from './shared'
import { contactItems, endDatePatch, updaters } from './utils'

interface Props {
  resume: ResumeData
  onChange: (r: ResumeData) => void
  onAdd: (section: SectionKind, sectionId?: string) => void
}

function ExecHeading({ title }: { title: ReactNode }) {
  return (
    <div>
      <h2 className="text-[0.72em] font-bold tracking-[0.22em] uppercase text-neutral-800">
        {title}
      </h2>
      <div className="mt-[0.3em] h-px w-full bg-neutral-300" />
    </div>
  )
}

const customTheme: CustomTheme = {
  section: ({ title, body, className }) => (
    <section className={`mt-[1.9em] ${className}`}>
      <ExecHeading title={title} />
      <div className="mt-[0.9em]">{body}</div>
    </section>
  ),
  text: 'text-[0.9em] leading-relaxed',
  bullets:
    'list-disc space-y-[0.2em] pl-[1.3em] text-[0.85em] leading-relaxed text-neutral-600 marker:text-neutral-400',
  entry: {
    wrap: 'mb-[1.3em] last:mb-0',
    title: 'text-[0.95em] font-semibold',
    subtitle: 'text-[0.85em] text-neutral-500',
    date: 'text-[0.73em] tracking-[0.05em] text-neutral-500 uppercase',
    bullets:
      'mt-[0.4em] list-disc space-y-[0.2em] pl-[1.3em] text-[0.85em] leading-relaxed text-neutral-600 marker:text-neutral-400',
  },
}

export default function ExecutiveTemplate({ resume, onChange, onAdd }: Props) {
  const { personal: p } = resume
  const contacts = contactItems(resume, onChange)
  const up = updaters(resume, onChange)
  const skillStyle = up.levelStyle('skills')

  return (
    <div className="px-[18mm] py-[17mm] text-neutral-800">
      <header>
        <EditableText
          as="h1"
          value={p.fullName}
          onChange={up.personal('fullName')}
          placeholder="Your name"
          className="block text-[2.4em] leading-none font-bold tracking-tight text-neutral-900"
        />
        <EditableText
          value={p.jobTitle}
          onChange={up.personal('jobTitle')}
          placeholder="Job title"
          className={`mt-[0.35em] block text-[1.05em] font-medium text-(--accent) ${
            p.jobTitle ? '' : 'print:hidden'
          }`}
        />
        <div
          className={`mt-[1em] flex flex-wrap gap-x-[1.3em] gap-y-[0.25em] text-[0.75em] text-neutral-500 ${
            contacts.some((c) => c.text.trim()) ? '' : 'print:hidden'
          }`}
        >
          {contacts.map((c) => (
            <span
              key={c.key}
              className={`inline-flex items-center gap-[0.4em] ${c.text.trim() ? '' : 'print:hidden'}`}
            >
              <OptionalContactIcon name={c.icon} />
              <EditableText
                value={c.text}
                onChange={c.onChange}
                placeholder={c.placeholder}
              />
            </span>
          ))}
        </div>
      </header>

      <section
        hidden={!up.shown('summary')}
        className={`mt-[1.9em] ${resume.summary ? '' : 'print:hidden'}`}
      >
        <ExecHeading title={<EditableHeading {...up.title('summary', 'Profile')} />} />
        <EditableText
          as="p"
          multiline
          value={resume.summary}
          onChange={(v) => up.set('summary', v)}
          placeholder="Write a short professional summary…"
          className="mt-[0.8em] block text-[0.9em] leading-relaxed whitespace-pre-line"
        />
      </section>

      <section
        hidden={!up.shown('experience')}
        className={`mt-[1.9em] ${resume.experience.length ? '' : 'print:hidden'}`}
      >
        <ExecHeading title={<EditableHeading {...up.title('experience', 'Experience')} />} />
        <div className="mt-[0.9em]">
          {resume.experience.map((exp) => {
            const set = up.exp(exp.id)
            const end = exp.current ? 'Present' : exp.endDate
            return (
              <div key={exp.id} className="mb-[1.3em] break-inside-avoid last:mb-0">
                <div className="flex items-baseline justify-between gap-[1em]">
                  <div className="text-[0.95em]">
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
                      className="text-neutral-500"
                    />
                  </div>
                  <div className="shrink-0 text-[0.73em] tracking-[0.05em] text-neutral-500 uppercase">
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
                  className={`block text-[0.76em] text-neutral-400 ${
                    exp.location ? '' : 'print:hidden'
                  }`}
                />
                <EditableLines
                  lines={exp.description ? exp.description.split('\n') : []}
                  onChange={(lines) => set({ description: lines.join('\n') })}
                  className="mt-[0.4em] list-disc space-y-[0.2em] pl-[1.3em] text-[0.85em] leading-relaxed text-neutral-600 marker:text-neutral-400"
                  placeholder="Add a bullet point"
                />
              </div>
            )
          })}
          <AddRow label="Add position" onClick={() => onAdd('experience')} />
        </div>
      </section>

      <section
        hidden={!up.shown('education')}
        className={`mt-[1.9em] ${resume.education.length ? '' : 'print:hidden'}`}
      >
        <ExecHeading title={<EditableHeading {...up.title('education', 'Education')} />} />
        <div className="mt-[0.9em]">
          {resume.education.map((edu) => {
            const set = up.edu(edu.id)
            return (
              <div key={edu.id} className="mb-[1em] break-inside-avoid last:mb-0">
                <div className="flex items-baseline justify-between gap-[1em]">
                  <div className="text-[0.95em]">
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
                      className="text-neutral-500"
                    />
                  </div>
                  <div className="shrink-0 text-[0.73em] tracking-[0.05em] text-neutral-500 uppercase">
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
                <EducationLevel {...up.eduLevel(edu)} className="text-(--accent)" />
              </div>
            )
          })}
          <AddRow label="Add education" onClick={() => onAdd('education')} />
        </div>
      </section>

      <section
        hidden={!up.shown('skills')}
        className={`mt-[1.9em] break-inside-avoid ${resume.skills.length ? '' : 'print:hidden'}`}
      >
        <ExecHeading title={<EditableHeading {...up.title('skills', 'Skills')} />} />
        {skillStyle === 'none' ? (
          <EditableText
            as="p"
            multiline
            value={resume.skills.join(' · ')}
            onChange={(v) =>
              up.list('skills')(
                v
                  .split(/[·,\n]+/)
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            placeholder="TypeScript · React · Node.js…"
            className="mt-[0.8em] block text-[0.87em] leading-relaxed whitespace-pre-line text-neutral-600"
          />
        ) : (
          <div className="mt-[0.8em]">
            <LevelList
              {...up.levelList('skills')}
              style={skillStyle}
              theme={customTheme}
              placeholder="Skill"
            />
          </div>
        )}
      </section>

      <CustomSections
        resume={resume}
        onChange={onChange}
        onAdd={onAdd}
        column="all"
        theme={customTheme}
      />
    </div>
  )
}
