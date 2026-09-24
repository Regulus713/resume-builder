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

const bullets =
  'list-disc space-y-[0.15em] pl-[1.3em] text-[0.85em] leading-relaxed text-neutral-600 marker:text-neutral-400'

const mainTheme: CustomTheme = {
  section: ({ title, body, className }) => (
    <section className={`mt-[1.6em] ${className}`}>
      <SectionHeading title={title} className="text-(--accent)" />
      <div className="mt-[0.4em] h-px w-full bg-(--accent) opacity-25" />
      <div className="mt-[0.8em]">{body}</div>
    </section>
  ),
  chip: 'rounded-full border border-(--accent) px-[0.7em] py-[0.2em] text-[0.72em] font-medium text-(--accent)',
  text: 'text-[0.88em] leading-relaxed',
  bullets,
  entry: {
    wrap: 'mb-[1.2em] last:mb-0',
    title: 'text-[0.95em] font-semibold',
    subtitle: 'text-[0.78em] font-medium text-(--accent)',
    date: 'text-[0.78em] text-neutral-500',
    bullets: `mt-[0.35em] ${bullets}`,
  },
}

const railTheme: CustomTheme = {
  section: ({ title, body, className }) => (
    <div className={`mt-[1.6em] break-inside-avoid ${className}`}>
      <SectionHeading title={title} className="text-white" />
      <div className="mt-[0.8em]">{body}</div>
    </div>
  ),
  chip: 'rounded-full border border-white/60 px-[0.7em] py-[0.2em] text-[0.72em] font-medium text-white',
  text: 'text-[0.78em] leading-relaxed',
  bullets:
    'list-disc space-y-[0.3em] pl-[1.2em] text-[0.78em] leading-snug marker:text-white/60',
  entry: {
    wrap: 'mb-[0.9em] last:mb-0',
    title: 'text-[0.82em] font-semibold',
    subtitle: 'text-[0.76em] opacity-90',
    date: 'text-[0.7em] opacity-75',
    bullets:
      'mt-[0.2em] list-disc space-y-[0.1em] pl-[1.2em] text-[0.74em] leading-snug opacity-90',
    stacked: true,
  },
  dark: true,
}

export default function RightRailTemplate({ resume, onChange, onAdd }: Props) {
  const { personal: p } = resume
  const contacts = contactItems(resume, onChange)
  const up = updaters(resume, onChange)
  const skillStyle = up.levelStyle('skills')

  return (
    <div className="flex min-h-[inherit] flex-col text-neutral-800">
      <header className="px-[10mm] pt-[10mm] pb-[5mm]">
        <EditableText
          as="h1"
          value={p.fullName}
          onChange={up.personal('fullName')}
          placeholder="Your name"
          className="block text-[1.9em] leading-tight font-bold tracking-tight text-neutral-900"
        />
        <EditableText
          value={p.jobTitle}
          onChange={up.personal('jobTitle')}
          placeholder="Job title"
          className={`mt-[0.2em] block text-[1em] font-semibold text-(--accent) ${
            p.jobTitle ? '' : 'print:hidden'
          }`}
        />
      </header>

      <div className="flex flex-1">
        <main className="flex-1 px-[10mm] py-[7mm]">
          <section
            hidden={!up.shown('summary')}
            className={resume.summary ? '' : 'print:hidden'}
          >
            <SectionHeading
              title={<EditableHeading {...up.title('summary', 'Profile')} />}
              className="text-(--accent)"
            />
            <div className="mt-[0.4em] h-px w-full bg-(--accent) opacity-25" />
            <EditableText
              as="p"
              multiline
              value={resume.summary}
              onChange={(v) => up.set('summary', v)}
              placeholder="Write a short professional summary…"
              className="mt-[0.7em] block text-[0.88em] leading-relaxed whitespace-pre-line"
            />
          </section>

          <section
            hidden={!up.shown('experience')}
            className={`mt-[1.6em] ${resume.experience.length ? '' : 'print:hidden'}`}
          >
            <SectionHeading
              title={<EditableHeading {...up.title('experience', 'Experience')} />}
              className="text-(--accent)"
            />
            <div className="mt-[0.4em] h-px w-full bg-(--accent) opacity-25" />
            <div className="mt-[0.8em]">
              {resume.experience.map((exp) => {
                const set = up.exp(exp.id)
                const end = exp.current ? 'Present' : exp.endDate
                return (
                  <div key={exp.id} className="mb-[1.2em] break-inside-avoid last:mb-0">
                    <EditableText
                      value={exp.role}
                      onChange={(v) => set({ role: v })}
                      placeholder="Role"
                      className="block text-[0.95em] font-semibold"
                    />
                    <div className="mt-[0.1em] flex flex-wrap items-baseline justify-between gap-x-[1em] text-[0.78em]">
                      <span className="font-medium text-(--accent)">
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
                      <span className="text-neutral-500">
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

          <CustomSections
            resume={resume}
            onChange={onChange}
            onAdd={onAdd}
            column="main"
            theme={mainTheme}
          />
        </main>

        <aside className="w-[33%] shrink-0 bg-(--accent) px-[7mm] py-[10mm] text-white">
          <div className={contacts.some((c) => c.text.trim()) ? '' : 'print:hidden'}>
            <SectionHeading title="Contact" className="text-white" />
            <ul className="mt-[0.8em] space-y-[0.55em] text-[0.78em]">
              {contacts.map((c) => (
                <li
                  key={c.key}
                  className={`flex items-start gap-[0.6em] break-all ${
                    c.text.trim() ? '' : 'print:hidden'
                  }`}
                >
                  <Icon
                    name={c.icon}
                    className="contact-icon mt-[0.1em] h-[1em] w-[1em] shrink-0 opacity-80"
                  />
                  <EditableText
                    value={c.text}
                    onChange={c.onChange}
                    placeholder={c.placeholder}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div
            hidden={!up.shown('skills')}
            className={`mt-[1.6em] break-inside-avoid ${resume.skills.length ? '' : 'print:hidden'}`}
          >
            <SectionHeading
              title={<EditableHeading {...up.title('skills', 'Skills')} />}
              className="text-white"
            />
            <div className="mt-[0.8em]">
              {skillStyle === 'none' ? (
                <EditableChips
                  skills={resume.skills}
                  onChange={up.list('skills')}
                  onAdd={() => onAdd('skills')}
                  chipClassName="rounded-full border border-white/60 px-[0.7em] py-[0.2em] text-[0.72em] font-medium text-white"
                />
              ) : (
                <LevelList
                  {...up.levelList('skills')}
                  style={skillStyle}
                  theme={railTheme}
                  placeholder="Skill"
                />
              )}
            </div>
          </div>

          <div
            hidden={!up.shown('education')}
            className={`mt-[1.6em] break-inside-avoid ${resume.education.length ? '' : 'print:hidden'}`}
          >
            <SectionHeading
              title={<EditableHeading {...up.title('education', 'Education')} />}
              className="text-white"
            />
            <div className="mt-[0.8em] space-y-[0.9em]">
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
                      className={`block text-[0.76em] opacity-90 ${
                        edu.school ? '' : 'print:hidden'
                      }`}
                    />
                    <div className="text-[0.7em] opacity-75">
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
                      className={`text-[0.7em] opacity-75 ${
                        edu.location ? '' : 'print:hidden'
                      }`}
                    />
                    <EducationLevel {...up.eduLevel(edu)} className="" />
                  </div>
                )
              })}
              <AddRow
                dark
                label="Add education"
                onClick={() => onAdd('education')}
              />
            </div>
          </div>

          <CustomSections
            resume={resume}
            onChange={onChange}
            onAdd={onAdd}
            column="side"
            theme={railTheme}
          />
        </aside>
      </div>
    </div>
  )
}
