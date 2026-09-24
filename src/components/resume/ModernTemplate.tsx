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

const customTheme: CustomTheme = {
  section: ({ title, body, className }) => (
    <section className={`mt-[1.5em] ${className}`}>
      <SectionHeading title={title} className="text-(--accent)" />
      <div className="mt-[0.7em]">{body}</div>
    </section>
  ),
  chip: 'rounded-md bg-(--accent)/10 px-[0.8em] py-[0.3em] text-[0.78em] font-medium text-(--accent)',
  text: 'text-[0.88em] leading-relaxed',
  bullets,
  entry: {
    wrap: 'mb-[1.1em] last:mb-0',
    title: 'text-[0.95em] font-semibold',
    subtitle: 'text-[0.78em] font-medium text-(--accent)',
    date: 'text-[0.72em] font-medium text-neutral-500',
    bullets: `mt-[0.35em] ${bullets}`,
  },
}

export default function ModernTemplate({ resume, onChange, onAdd }: Props) {
  const { personal: p } = resume
  const contacts = contactItems(resume, onChange)
  const up = updaters(resume, onChange)
  const skillStyle = up.levelStyle('skills')

  return (
    <div className="text-neutral-800">
      <header className="bg-(--accent) px-[12mm] py-[11mm] text-white">
        <EditableText
          as="h1"
          value={p.fullName}
          onChange={up.personal('fullName')}
          placeholder="Your name"
          className="block text-[2em] leading-tight font-bold tracking-tight"
        />
        <EditableText
          value={p.jobTitle}
          onChange={up.personal('jobTitle')}
          placeholder="Job title"
          className={`mt-[0.2em] block text-[1.05em] font-medium opacity-90 ${
            p.jobTitle ? '' : 'print:hidden'
          }`}
        />
        <div
          className={`mt-[1em] flex flex-wrap gap-x-[1.4em] gap-y-[0.3em] text-[0.75em] opacity-90 ${
            contacts.some((c) => c.text.trim()) ? '' : 'print:hidden'
          }`}
        >
          {contacts.map((c) => (
            <span
              key={c.key}
              className={`flex items-center gap-[0.5em] ${c.text.trim() ? '' : 'print:hidden'}`}
            >
              <Icon name={c.icon} className="contact-icon h-[1.05em] w-[1.05em]" />
              <EditableText
                value={c.text}
                onChange={c.onChange}
                placeholder={c.placeholder}
              />
            </span>
          ))}
        </div>
      </header>

      <div className="px-[12mm] py-[9mm]">
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
            className="mt-[0.6em] block text-[0.88em] leading-relaxed whitespace-pre-line"
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
          <div className="mt-[0.9em]">
            {resume.experience.map((exp) => {
              const set = up.exp(exp.id)
              const end = exp.current ? 'Present' : exp.endDate
              return (
                <div
                  key={exp.id}
                  className="relative border-l-2 border-(--accent)/30 pb-[1.1em] pl-[1.1em] break-inside-avoid last:pb-0"
                >
                  <span className="absolute top-[0.3em] -left-[0.45em] h-[0.65em] w-[0.65em] rounded-full bg-(--accent)" />
                  <div className="flex items-baseline justify-between gap-[1em]">
                    <EditableText
                      value={exp.role}
                      onChange={(v) => set({ role: v })}
                      placeholder="Role"
                      className="text-[0.95em] font-semibold"
                    />
                    <span className="shrink-0 text-[0.72em] font-medium text-neutral-500">
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
                  <span className="text-[0.78em] font-medium text-(--accent)">
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
          hidden={!up.shown('education')}
          className={`mt-[1.5em] break-inside-avoid ${resume.education.length ? '' : 'print:hidden'}`}
        >
          <SectionHeading
            title={<EditableHeading {...up.title('education', 'Education')} />}
            className="text-(--accent)"
          />
          <div className="mt-[0.8em] grid grid-cols-2 gap-x-[2em] gap-y-[0.9em]">
            {resume.education.map((edu) => {
              const set = up.edu(edu.id)
              return (
                <div key={edu.id}>
                  <EditableText
                    value={edu.degree}
                    onChange={(v) => set({ degree: v })}
                    placeholder="Degree"
                    className="block text-[0.9em] font-semibold"
                  />
                  <span className="text-[0.78em] text-neutral-600">
                    <EditableText
                      value={edu.school}
                      onChange={(v) => set({ school: v })}
                      placeholder="School"
                    />
                    {edu.school && edu.location ? ' · ' : ' '}
                    <EditableText
                      value={edu.location}
                      onChange={(v) => set({ location: v })}
                      placeholder="Location"
                    />
                  </span>
                  <div className="text-[0.72em] text-neutral-500">
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
                    as="p"
                    multiline
                    value={edu.description}
                    onChange={(v) => set({ description: v })}
                    placeholder="Notes…"
                    className={`mt-[0.2em] block text-[0.78em] whitespace-pre-line text-neutral-600 ${
                      edu.description ? '' : 'print:hidden'
                    }`}
                  />
                  <EducationLevel {...up.eduLevel(edu)} className="text-(--accent)" />
                </div>
              )
            })}
          </div>
          <AddRow label="Add education" onClick={() => onAdd('education')} />
        </section>

        <section
          hidden={!up.shown('skills')}
          className={`mt-[1.5em] break-inside-avoid ${resume.skills.length ? '' : 'print:hidden'}`}
        >
          <SectionHeading
            title={<EditableHeading {...up.title('skills', 'Skills')} />}
            className="text-(--accent)"
          />
          <div className="mt-[0.7em]">
            {skillStyle === 'none' ? (
              <EditableChips
                skills={resume.skills}
                onChange={up.list('skills')}
                onAdd={() => onAdd('skills')}
                chipClassName="rounded-md bg-(--accent)/10 px-[0.8em] py-[0.3em] text-[0.78em] font-medium text-(--accent)"
              />
            ) : (
              <LevelList
                {...up.levelList('skills')}
                style={skillStyle}
                theme={customTheme}
                placeholder="Skill"
              />
            )}
          </div>
        </section>

        <CustomSections
          resume={resume}
          onChange={onChange}
          onAdd={onAdd}
          column="all"
          theme={customTheme}
        />
      </div>
    </div>
  )
}
