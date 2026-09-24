import type { ReactNode } from 'react'
import type { ResumeData, SectionKind } from '../../types'
import CustomSections, { type CustomTheme } from './CustomSections'
import { EditableLines, EditableText } from './Editable'
import { EducationLevel, LevelList } from './Level'
import { AddRow, EditableHeading, Icon } from './shared'
import {
  contactItems,
  endDatePatch,
  updaters,
  type SectionIcon,
} from './utils'

interface Props {
  resume: ResumeData
  onChange: (r: ResumeData) => void
  onAdd: (section: SectionKind, sectionId?: string) => void
}

function RailHeading({ title }: { title: ReactNode }) {
  return (
    <div>
      <h2 className="text-[0.9em] font-bold tracking-[0.16em] uppercase text-(--accent)">
        {title}
      </h2>
      <div className="mt-[0.3em] h-px w-full bg-(--accent) opacity-40" />
    </div>
  )
}

function MainSection({
  icon,
  title,
  children,
  hidden,
  className = '',
}: {
  icon: SectionIcon
  title: ReactNode
  children: ReactNode
  hidden?: boolean
  className?: string
}) {
  return (
    <section hidden={hidden} className={`relative mb-[1.7em] last:mb-0 ${className}`}>
      <span className="absolute top-[0.05em] -left-[2.3em] flex h-[1.5em] w-[1.5em] items-center justify-center rounded-full bg-(--accent) text-white">
        <Icon name={icon} className="h-[0.9em] w-[0.9em]" />
      </span>
      <h2 className="border-b border-(--accent) pb-[0.25em] text-[1em] font-bold tracking-[0.16em] uppercase">
        {title}
      </h2>
      <div className="mt-[0.7em]">{children}</div>
      <span
        aria-hidden
        className="absolute -bottom-[0.9em] -left-[1.76em] h-[0.42em] w-[0.42em] rounded-full border-2 border-neutral-400 bg-white"
      />
    </section>
  )
}

const railTheme: CustomTheme = {
  section: ({ title, body, className }) => (
    <div className={`mt-[1.8em] ${className}`}>
      <RailHeading title={title} />
      <div className="mt-[0.7em]">{body}</div>
    </div>
  ),
  text: 'text-[0.78em] leading-snug',
  bullets:
    'list-disc space-y-[0.3em] pl-[1.3em] text-[0.78em] leading-snug marker:text-[0.6em]',
  entry: {
    wrap: 'mb-[0.9em] last:mb-0',
    title: 'text-[0.82em] font-bold',
    subtitle: 'text-[0.76em] text-neutral-600',
    date: 'text-[0.7em] text-neutral-500',
    bullets:
      'mt-[0.2em] list-disc space-y-[0.1em] pl-[1.3em] text-[0.74em] leading-snug marker:text-[0.6em]',
    stacked: true,
  },
}

const mainTheme: CustomTheme = {
  section: ({ title, body, className }) => (
    <MainSection icon="star" title={title} className={className}>
      {body}
    </MainSection>
  ),
  text: 'text-[0.85em] leading-relaxed text-neutral-700',
  bullets:
    'list-disc space-y-[0.12em] pl-[1.4em] text-[0.82em] leading-relaxed text-neutral-700 marker:text-[0.55em]',
  entry: {
    wrap: 'mb-[1.1em] last:mb-0',
    title: 'text-[0.92em] font-bold',
    subtitle: 'text-[0.78em] text-neutral-500',
    date: 'text-[0.72em] text-neutral-500',
    bullets:
      'mt-[0.3em] list-disc space-y-[0.12em] pl-[1.4em] text-[0.82em] leading-relaxed text-neutral-700 marker:text-[0.55em]',
  },
}

export default function TimelineTemplate({ resume, onChange, onAdd }: Props) {
  const { personal: p } = resume
  const contacts = contactItems(resume, onChange)
  const up = updaters(resume, onChange)
  const skillStyle = up.levelStyle('skills')
  const langStyle = up.levelStyle('languages')
  const languages = resume.languages ?? []

  return (
    <div className="flex min-h-[inherit] flex-col text-neutral-800">
      <header className="bg-(--accent) py-[8mm]">
        <div className="ml-[31%] pr-[8mm] pl-[8mm]">
          <EditableText
            as="h1"
            value={p.fullName}
            onChange={up.personal('fullName')}
            placeholder="Your name"
            className="block text-[2em] leading-tight font-bold tracking-tight text-white"
          />
          <EditableText
            value={p.jobTitle}
            onChange={up.personal('jobTitle')}
            placeholder="Job title"
            className={`mt-[0.3em] block text-[1em] font-normal tracking-[0.12em] text-white/90 ${
              p.jobTitle ? '' : 'print:hidden'
            }`}
          />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-[31%] shrink-0 bg-neutral-200 px-[6mm] py-[8mm]">
          <div className={contacts.some((c) => c.text.trim()) ? '' : 'print:hidden'}>
            <RailHeading title="Contact" />
            <ul className="mt-[0.7em] space-y-[0.55em] text-[0.78em]">
              {contacts.map((c) => (
                <li
                  key={c.key}
                  className={`flex items-start gap-[0.6em] break-all ${
                    c.text.trim() ? '' : 'print:hidden'
                  }`}
                >
                  <Icon
                    name={c.icon}
                    className="contact-icon mt-[0.1em] h-[1em] w-[1em] shrink-0 text-(--accent)"
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
            className={`mt-[1.8em] ${resume.skills.length ? '' : 'print:hidden'}`}
          >
            <RailHeading title={<EditableHeading {...up.title('skills', 'Skills')} />} />
            {skillStyle === 'none' ? (
              <EditableLines
                lines={resume.skills}
                onChange={up.list('skills')}
                className="mt-[0.7em] list-disc space-y-[0.3em] pl-[1.3em] text-[0.78em] leading-snug marker:text-[0.6em]"
                placeholder="Add a skill"
              />
            ) : (
              <div className="mt-[0.7em]">
                <LevelList
                  {...up.levelList('skills')}
                  style={skillStyle}
                  theme={railTheme}
                  placeholder="Skill"
                />
              </div>
            )}
          </div>

          <div
            hidden={!up.shown('languages')}
            className={`mt-[1.8em] ${languages.length ? '' : 'print:hidden'}`}
          >
            <RailHeading title={<EditableHeading {...up.title('languages', 'Languages')} />} />
            {langStyle === 'none' ? (
              <EditableLines
                lines={languages}
                onChange={up.list('languages')}
                className="mt-[0.7em] list-disc space-y-[0.3em] pl-[1.3em] text-[0.78em] leading-snug marker:text-[0.6em]"
                placeholder="Add a language"
              />
            ) : (
              <div className="mt-[0.7em]">
                <LevelList
                  {...up.levelList('languages')}
                  style={langStyle}
                  theme={railTheme}
                  placeholder="Language"
                />
              </div>
            )}
          </div>

          <CustomSections
            resume={resume}
            onChange={onChange}
            onAdd={onAdd}
            column="side"
            theme={railTheme}
            includeLanguages={false}
          />
        </aside>

        <main className="flex-1 px-[8mm] py-[8mm]">
          <div className="relative pl-[2.3em]">
            <div
              aria-hidden
              className="absolute top-[0.9em] bottom-[0.5em] left-[0.74em] w-px bg-neutral-300"
            />

            <MainSection
              icon="user"
              title={<EditableHeading {...up.title('summary', 'Profile')} />}
              hidden={!up.shown('summary')}
            >
              <div className={resume.summary ? '' : 'print:hidden'}>
                <EditableText
                  as="p"
                  multiline
                  value={resume.summary}
                  onChange={(v) => up.set('summary', v)}
                  placeholder="Write a short professional summary…"
                  className="block text-[0.85em] leading-relaxed whitespace-pre-line text-neutral-700"
                />
              </div>
            </MainSection>

            <MainSection
              icon="case"
              title={<EditableHeading {...up.title('experience', 'Experience')} />}
              hidden={!up.shown('experience')}
            >
              <div className={resume.experience.length ? '' : 'print:hidden'}>
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
                          className="text-[0.92em] font-bold"
                        />
                        <span className="shrink-0 text-[0.72em] text-neutral-500">
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
                      <span className="block text-[0.78em] text-neutral-500">
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
                        className="mt-[0.3em] list-disc space-y-[0.12em] pl-[1.4em] text-[0.82em] leading-relaxed text-neutral-700 marker:text-[0.55em]"
                        placeholder="Add a bullet point"
                      />
                    </div>
                  )
                })}
                <AddRow label="Add position" onClick={() => onAdd('experience')} />
              </div>
            </MainSection>

            <MainSection
              icon="cap"
              title={<EditableHeading {...up.title('education', 'Education')} />}
              hidden={!up.shown('education')}
            >
              <div className={resume.education.length ? '' : 'print:hidden'}>
                {resume.education.map((edu) => {
                  const set = up.edu(edu.id)
                  return (
                    <div key={edu.id} className="mb-[1em] break-inside-avoid last:mb-0">
                      <div className="flex items-baseline justify-between gap-[1em]">
                        <EditableText
                          value={edu.degree}
                          onChange={(v) => set({ degree: v })}
                          placeholder="Degree"
                          className="text-[0.92em] font-bold"
                        />
                        <span className="shrink-0 text-[0.72em] text-neutral-500">
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
                        value={edu.school}
                        onChange={(v) => set({ school: v })}
                        placeholder="School"
                        className={`block text-[0.82em] ${
                          edu.school ? '' : 'print:hidden'
                        }`}
                      />
                      <EditableText
                        as="p"
                        multiline
                        value={edu.description}
                        onChange={(v) => set({ description: v })}
                        placeholder="GPA, honours…"
                        className={`block text-[0.8em] whitespace-pre-line text-neutral-600 ${
                          edu.description ? '' : 'print:hidden'
                        }`}
                      />
                      <EducationLevel {...up.eduLevel(edu)} className="text-(--accent)" />
                    </div>
                  )
                })}
                <AddRow label="Add education" onClick={() => onAdd('education')} />
              </div>
            </MainSection>

            <CustomSections
              resume={resume}
              onChange={onChange}
              onAdd={onAdd}
              column="main"
              theme={mainTheme}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
