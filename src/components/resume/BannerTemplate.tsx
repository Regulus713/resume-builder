import type { ResumeData, SectionKind } from '../../types'
import CustomSections, { type CustomTheme } from './CustomSections'
import { EditableChips, EditableLines, EditableText } from './Editable'
import { EducationLevel, LevelList } from './Level'
import { AddRow, EditableHeading, Icon, SectionHeading } from './shared'
import { contactItems, endDatePatch, updaters } from './utils'

interface Props {
  resume: ResumeData
  onChange: (r: ResumeData) => void
  onAdd: (section: SectionKind, sectionId?: string) => void
}

const chip =
  'rounded-md bg-(--accent)/10 px-[0.7em] py-[0.25em] text-[0.72em] font-medium text-(--accent)'

const mainTheme: CustomTheme = {
  section: ({ title, body, className }) => (
    <section className={`mt-[1.5em] ${className}`}>
      <SectionHeading title={title} className="text-(--accent)" />
      <div className="mt-[0.7em]">{body}</div>
    </section>
  ),
  chip,
  text: 'text-[0.86em] leading-relaxed',
  bullets:
    'list-disc space-y-[0.12em] pl-[1.3em] text-[0.82em] leading-relaxed text-neutral-600 marker:text-neutral-400',
  entry: {
    wrap: 'mb-[1.1em] last:mb-0',
    title: 'text-[0.92em] font-semibold',
    subtitle: 'text-[0.76em] font-medium text-neutral-500',
    date: 'text-[0.7em] text-neutral-500',
    bullets:
      'mt-[0.3em] list-disc space-y-[0.12em] pl-[1.3em] text-[0.82em] leading-relaxed text-neutral-600 marker:text-neutral-400',
  },
}

const sideTheme: CustomTheme = {
  section: ({ title, body, className }) => (
    <div className={`mt-[1.5em] break-inside-avoid ${className}`}>
      <SectionHeading title={title} className="text-(--accent)" />
      <div className="mt-[0.6em]">{body}</div>
    </div>
  ),
  chip,
  text: 'text-[0.78em] leading-relaxed',
  bullets:
    'list-disc space-y-[0.3em] pl-[1.2em] text-[0.78em] leading-snug marker:text-neutral-400',
  entry: {
    wrap: 'mb-[0.9em] last:mb-0',
    title: 'text-[0.82em] font-semibold',
    subtitle: 'text-[0.76em] text-neutral-600',
    date: 'text-[0.7em] text-neutral-500',
    bullets:
      'mt-[0.2em] list-disc space-y-[0.1em] pl-[1.2em] text-[0.74em] leading-snug text-neutral-600',
    stacked: true,
  },
}

export default function BannerTemplate({ resume, onChange, onAdd }: Props) {
  const { personal: p } = resume
  const contacts = contactItems(resume, onChange)
  const up = updaters(resume, onChange)
  const skillStyle = up.levelStyle('skills')

  return (
    <div className="flex min-h-[inherit] flex-col text-neutral-800">
      <header className="flex items-end justify-between gap-[2em] bg-(--accent) px-[10mm] py-[9mm] text-white">
        <div>
          <EditableText
            as="h1"
            value={p.fullName}
            onChange={up.personal('fullName')}
            placeholder="Your name"
            className="block text-[1.9em] leading-tight font-bold tracking-tight"
          />
          <EditableText
            value={p.jobTitle}
            onChange={up.personal('jobTitle')}
            placeholder="Job title"
            className={`mt-[0.2em] block text-[0.95em] font-medium opacity-90 ${
              p.jobTitle ? '' : 'print:hidden'
            }`}
          />
        </div>
        <div
          className={`shrink-0 space-y-[0.35em] text-right text-[0.72em] opacity-90 ${
            contacts.some((c) => c.text.trim()) ? '' : 'print:hidden'
          }`}
        >
          {contacts.map((c) => (
            <div
              key={c.key}
              className={`flex items-center justify-end gap-[0.5em] ${
                c.text.trim() ? '' : 'print:hidden'
              }`}
            >
              <EditableText
                value={c.text}
                onChange={c.onChange}
                placeholder={c.placeholder}
              />
              <Icon name={c.icon} className="contact-icon h-[1em] w-[1em] shrink-0" />
            </div>
          ))}
        </div>
      </header>

      <div className="flex flex-1">
        <main className="w-[63%] px-[9mm] py-[8mm]">
          <section
            hidden={!up.shown('summary')}
            className={resume.summary ? '' : 'print:hidden'}
          >
            <SectionHeading
              title={<EditableHeading {...up.title('summary', 'Profile')} />}
              className="text-(--accent)"
            />
            <EditableText
              as="p"
              multiline
              value={resume.summary}
              onChange={(v) => up.set('summary', v)}
              placeholder="Write a short professional summary…"
              className="mt-[0.5em] block text-[0.86em] leading-relaxed whitespace-pre-line"
            />
          </section>

          <section
            hidden={!up.shown('experience')}
            className={`mt-[1.5em] ${resume.experience.length ? '' : 'print:hidden'}`}
          >
            <SectionHeading
              title={<EditableHeading {...up.title('experience', 'Experience')} />}
              className="text-(--accent)"
            />
            <div className="mt-[0.7em]">
              {resume.experience.map((exp) => {
                const set = up.exp(exp.id)
                const end = exp.current ? 'Present' : exp.endDate
                return (
                  <div key={exp.id} className="mb-[1.1em] break-inside-avoid last:mb-0">
                    <div className="flex items-baseline justify-between gap-[1em]">
                      <EditableText
                        value={exp.role}
                        onChange={(v) => set({ role: v })}
                        placeholder="Role"
                        className="text-[0.92em] font-semibold"
                      />
                      <span className="shrink-0 text-[0.7em] text-neutral-500">
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
                    <span className="text-[0.76em] font-medium text-neutral-500">
                      <EditableText
                        value={exp.company}
                        onChange={(v) => set({ company: v })}
                        placeholder="Company"
                      />
                      {exp.company && exp.location ? ' · ' : ' '}
                      <EditableText
                        value={exp.location}
                        onChange={(v) => set({ location: v })}
                        placeholder="Location"
                      />
                    </span>
                    <EditableLines
                      lines={exp.description ? exp.description.split('\n') : []}
                      onChange={(lines) => set({ description: lines.join('\n') })}
                      className="mt-[0.3em] list-disc space-y-[0.12em] pl-[1.3em] text-[0.82em] leading-relaxed text-neutral-600 marker:text-neutral-400"
                      placeholder="Add a bullet point"
                    />
                  </div>
                )
              })}
              <AddRow label="Add position" onClick={() => onAdd('experience')} />
            </div>
          </section>

          <CustomSections
            resume={resume}
            onChange={onChange}
            onAdd={onAdd}
            column="main"
            theme={mainTheme}
          />
        </main>

        <aside className="flex-1 border-l border-neutral-200 px-[7mm] py-[8mm]">
          <div
            hidden={!up.shown('skills')}
            className={`break-inside-avoid ${resume.skills.length ? '' : 'print:hidden'}`}
          >
            <SectionHeading
              title={<EditableHeading {...up.title('skills', 'Skills')} />}
              className="text-(--accent)"
            />
            <div className="mt-[0.6em]">
              {skillStyle === 'none' ? (
                <EditableChips
                  skills={resume.skills}
                  onChange={up.list('skills')}
                  onAdd={() => onAdd('skills')}
                  chipClassName="rounded-md bg-(--accent)/10 px-[0.7em] py-[0.25em] text-[0.72em] font-medium text-(--accent)"
                />
              ) : (
                <LevelList
                  {...up.levelList('skills')}
                  style={skillStyle}
                  theme={sideTheme}
                  placeholder="Skill"
                />
              )}
            </div>
          </div>

          <div
            hidden={!up.shown('education')}
            className={`mt-[1.5em] break-inside-avoid ${resume.education.length ? '' : 'print:hidden'}`}
          >
            <SectionHeading
              title={<EditableHeading {...up.title('education', 'Education')} />}
              className="text-(--accent)"
            />
            <div className="mt-[0.6em] space-y-[0.9em]">
              {resume.education.map((edu) => {
                const set = up.edu(edu.id)
                return (
                  <div key={edu.id}>
                    <EditableText
                      value={edu.degree}
                      onChange={(v) => set({ degree: v })}
                      placeholder="Degree"
                      className="block text-[0.82em] font-semibold"
                    />
                    <EditableText
                      value={edu.school}
                      onChange={(v) => set({ school: v })}
                      placeholder="School"
                      className={`block text-[0.76em] text-neutral-600 ${
                        edu.school ? '' : 'print:hidden'
                      }`}
                    />
                    <div className="text-[0.7em] text-neutral-500">
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
                    <EditableText
                      value={edu.location}
                      onChange={(v) => set({ location: v })}
                      placeholder="Location"
                      className={`text-[0.7em] text-neutral-500 ${
                        edu.location ? '' : 'print:hidden'
                      }`}
                    />
                    <EducationLevel {...up.eduLevel(edu)} className="text-(--accent)" />
                  </div>
                )
              })}
              <AddRow label="Add education" onClick={() => onAdd('education')} />
            </div>
          </div>

          <CustomSections
            resume={resume}
            onChange={onChange}
            onAdd={onAdd}
            column="side"
            theme={sideTheme}
          />
        </aside>
      </div>
    </div>
  )
}
