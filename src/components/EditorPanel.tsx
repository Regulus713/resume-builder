import { useEffect, useState, type ReactNode } from 'react'
import type {
  BuiltinSectionId,
  CustomEntry,
  CustomField,
  CustomSection,
  EducationItem,
  ExperienceItem,
  FocusTarget,
  LevelListId,
  ResumeData,
} from '../types'
import IconPicker from './IconPicker'
import { Icon } from './resume/shared'
import {
  autoContactIcon,
  blankCustomEntry,
  contactIconFor,
  entryHasContent,
  isContactIcon,
  newCustomSection,
  remapLevels,
  updaters,
  withLevel,
} from './resume/utils'
import { LevelInput, LevelStylePicker } from './LevelControls'
import {
  BUILTIN_NAMES,
  COLUMNS,
  FIELD_SUGGESTIONS,
  SECTION_PRESETS,
  SECTION_TYPES,
  TYPE_ICON,
} from './sectionPresets'
import {
  AddButton,
  FieldLabel,
  IconButton,
  Input,
  ItemCard,
  ListEditor,
  Section,
  Segmented,
  TextAreaField,
  TextField,
  UiIcon,
} from './ui'

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
  const up = updaters(resume, onChange)
  const set = up.set
  // Newly created custom section: mount it open and scroll to it.
  const [justAdded, setJustAdded] = useState<string | null>(null)

  // When the preview adds an entry, reveal it here: open the section,
  // scroll to the new card and focus its first input.
  useEffect(() => {
    if (!focusTarget) return
    const item = focusTarget.id
      ? document.getElementById(`panel-item-${focusTarget.id}`)
      : null
    const key =
      focusTarget.kind === 'custom' ? `custom-${focusTarget.sectionId}` : focusTarget.kind
    const section = document.querySelector<HTMLElement>(`[data-section="${key}"]`)
    const target = item ?? section
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (item) {
      item
        .querySelector<HTMLElement>('input, textarea')
        ?.focus({ preventScroll: true })
    }
  }, [focusTarget])

  useEffect(() => {
    if (!justAdded) return
    document
      .querySelector(`[data-section="custom-${justAdded}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [justAdded])

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

  /** Rename + show/hide props shared by every built-in section card. */
  const builtin = (id: BuiltinSectionId) => {
    const name = BUILTIN_NAMES[id]
    const hidden = resume.hiddenSections.includes(id)
    return {
      title: resume.sectionTitles[id] || name,
      rename: {
        value: resume.sectionTitles[id] ?? '',
        placeholder: `${name} (template default)`,
        onChange: up.title(id, name).onChange,
      },
      hidden,
      onToggleHidden: () =>
        set(
          'hiddenSections',
          hidden
            ? resume.hiddenSections.filter((h) => h !== id)
            : [...resume.hiddenSections, id],
        ),
    }
  }

  const setCustomSections = (next: CustomSection[]) => set('customSections', next)

  /** ListEditor `renderExtra` for a built-in list: a 1–5 input when levels are on. */
  const levelInput = (id: LevelListId) => {
    if (up.levelStyle(id) === 'none') return undefined
    const { levels, labels, onLevel } = up.levelList(id)
    return (item: string) => (
      <LevelInput
        value={levels[item.trim()] ?? 0}
        labels={labels}
        onChange={(n) => onLevel(item, n)}
      />
    )
  }

  /** Icon button for a contact item (built-in field name or custom field id). */
  const iconPicker = (key: string, label: string, value: string, compact = false) => {
    const override = resume.contactIcons[key]
    const isAuto = !(override && isContactIcon(override))
    return (
      <IconPicker
        value={contactIconFor(resume, key, label, value)}
        auto={autoContactIcon(key, label, value)}
        isAuto={isAuto}
        onChange={up.contactIcon(key)}
        compact={compact}
      />
    )
  }

  return (
    <div className="space-y-2.5">
      <Section title="Personal details" icon="user" defaultOpen>
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
            leading={iconPicker('email', 'Email', resume.personal.email)}
          />
          <TextField
            label="Phone"
            value={resume.personal.phone}
            onChange={(v) => setPersonal('phone', v)}
            placeholder="+1 (555) 123-4567"
            leading={iconPicker('phone', 'Phone', resume.personal.phone)}
          />
        </div>
        <TextField
          label="Location"
          value={resume.personal.location}
          onChange={(v) => setPersonal('location', v)}
          placeholder="San Francisco, CA"
          leading={iconPicker('location', 'Location', resume.personal.location)}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <TextField
            label="Website"
            value={resume.personal.website}
            onChange={(v) => setPersonal('website', v)}
            placeholder="yoursite.dev"
            leading={iconPicker('website', 'Website', resume.personal.website)}
          />
          <TextField
            label="LinkedIn"
            value={resume.personal.linkedin}
            onChange={(v) => setPersonal('linkedin', v)}
            placeholder="linkedin.com/in/you"
            leading={iconPicker('linkedin', 'LinkedIn', resume.personal.linkedin)}
          />
        </div>
        <CustomFieldsEditor
          fields={resume.customFields}
          onChange={(v) => set('customFields', v)}
          onRemove={(id) => {
            // Drop the field and its icon override in one update.
            const icons = { ...resume.contactIcons }
            delete icons[id]
            onChange({
              ...resume,
              customFields: resume.customFields.filter((f) => f.id !== id),
              contactIcons: icons,
            })
          }}
          renderIcon={(f) => iconPicker(f.id, f.label, f.value, true)}
        />
        <p className="text-[11px] text-neutral-400">
          Click an icon to change it — brand logos (GitHub, Gmail, Facebook…) are
          detected automatically. Templates without icons can show them via
          Design → Contact icons.
        </p>
      </Section>

      <Section icon="text" {...builtin('summary')}>
        <TextAreaField
          label="Professional summary"
          value={resume.summary}
          onChange={(v) => set('summary', v)}
          placeholder="A short paragraph about who you are and what you do."
          rows={5}
        />
      </Section>

      <Section
        {...builtin('experience')}
        icon="briefcase"
        badge={resume.experience.length}
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
                className="h-4 w-4 rounded border-neutral-300 accent-blue-600"
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
        {...builtin('education')}
        icon="graduation"
        badge={resume.education.length}
        dataSection="education"
        openSignal={
          focusTarget?.kind === 'education' ? focusTarget.id : undefined
        }
      >
        <LevelStylePicker
          label="Progress display"
          value={up.levelStyle('education')}
          onChange={up.setLevelStyle('education')}
        />
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
            {up.levelStyle('education') !== 'none' && (
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2">
                <span className="text-xs font-medium text-neutral-600">Progress (1–5)</span>
                <LevelInput
                  value={edu.level ?? 0}
                  onChange={(level) => updateEducation(edu.id, { level })}
                />
              </div>
            )}
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
        {...builtin('skills')}
        icon="star"
        badge={resume.skills.length}
        dataSection="skills"
        openSignal={focusTarget?.kind === 'skills' ? focusTarget : undefined}
      >
        <LevelStylePicker
          value={up.levelStyle('skills')}
          onChange={up.setLevelStyle('skills')}
        />
        <ListEditor
          items={resume.skills}
          onChange={up.list('skills')}
          placeholder="e.g. TypeScript"
          addLabel="Add skill"
          renderExtra={levelInput('skills')}
        />
      </Section>

      <Section
        {...builtin('languages')}
        icon="globe"
        badge={resume.languages.length}
        dataSection="languages"
      >
        <LevelStylePicker
          value={up.levelStyle('languages')}
          onChange={up.setLevelStyle('languages')}
          labels="language"
        />
        <ListEditor
          items={resume.languages}
          onChange={up.list('languages')}
          placeholder="e.g. French"
          addLabel="Add language"
          renderExtra={levelInput('languages')}
        />
        <p className="text-[11px] text-neutral-400">
          Levels: 1 Basic · 2 Conversational · 3 Proficient · 4 Fluent · 5 Native.
          Shown in the side column of two-column templates.
        </p>
      </Section>

      {resume.customSections.map((s, i) => (
        <CustomSectionCard
          key={s.id}
          section={s}
          defaultOpen={s.id === justAdded}
          focusTarget={focusTarget}
          canMoveUp={i > 0}
          canMoveDown={i < resume.customSections.length - 1}
          onPatch={(patch) => up.custom(s.id)(patch)}
          onMove={(dir) => setCustomSections(move(resume.customSections, i, i + dir))}
          onRemove={() => {
            const hasContent =
              s.items.some((x) => x.trim()) ||
              s.entries.some(entryHasContent) ||
              s.text.trim()
            if (
              !hasContent ||
              window.confirm(`Delete the "${s.title || 'Untitled'}" section and its content?`)
            ) {
              setCustomSections(resume.customSections.filter((x) => x.id !== s.id))
            }
          }}
        />
      ))}

      <AddSectionPicker
        onAdd={(p) => {
          const s = newCustomSection(p.title, p.type, p.column)
          setCustomSections([...resume.customSections, s])
          setJustAdded(s.id)
        }}
      />
    </div>
  )
}

/* ---------- custom contact fields ---------- */

function CustomFieldsEditor({
  fields,
  onChange,
  onRemove,
  renderIcon,
}: {
  fields: CustomField[]
  onChange: (f: CustomField[]) => void
  onRemove: (id: string) => void
  renderIcon: (f: CustomField) => ReactNode
}) {
  const patch = (id: string, p: Partial<CustomField>) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, ...p } : f)))
  const add = (label = '') =>
    onChange([...fields, { id: crypto.randomUUID(), label, value: '' }])
  const suggestions = FIELD_SUGGESTIONS.filter(
    (s) => !fields.some((f) => f.label.toLowerCase() === s.toLowerCase()),
  )

  return (
    <div className="space-y-2 border-t border-dashed border-neutral-200 pt-3">
      <FieldLabel>Additional contact fields</FieldLabel>
      {fields.map((f, i) => (
        <div key={f.id} className="group flex items-center gap-1.5">
          {renderIcon(f)}
          <div className="w-24 shrink-0">
            <Input
              className="font-medium"
              value={f.label}
              placeholder="Label"
              aria-label="Field label"
              onChange={(e) => patch(f.id, { label: e.target.value })}
            />
          </div>
          <div className="min-w-0 flex-1">
            <Input
              value={f.value}
              placeholder={f.label ? `Your ${f.label}` : 'Value'}
              aria-label="Field value"
              onChange={(e) => patch(f.id, { value: e.target.value })}
            />
          </div>
          <span className="flex shrink-0 items-center gap-1 opacity-40 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <IconButton
              label="Move up"
              icon="arrowUp"
              disabled={i === 0}
              onClick={() => onChange(move(fields, i, i - 1))}
            />
            <IconButton
              label="Remove field"
              icon="x"
              danger
              onClick={() => onRemove(f.id)}
            />
          </span>
        </div>
      ))}
      <AddButton label="Add field" onClick={() => add()} />
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-neutral-400">Quick add:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white py-0.5 pr-2.5 pl-1.5 text-[11px] font-medium text-neutral-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              <Icon name={autoContactIcon('', s, '')} className="h-3.5 w-3.5" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- custom sections ---------- */

function CustomSectionCard({
  section: s,
  defaultOpen,
  focusTarget,
  canMoveUp,
  canMoveDown,
  onPatch,
  onMove,
  onRemove,
}: {
  section: CustomSection
  defaultOpen: boolean
  focusTarget?: FocusTarget
  canMoveUp: boolean
  canMoveDown: boolean
  onPatch: (p: Partial<CustomSection>) => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
}) {
  const count =
    s.type === 'entries'
      ? s.entries.length
      : s.type === 'text'
        ? undefined
        : s.items.filter((x) => x.trim()).length
  const patchEntry = (id: string, p: Partial<CustomEntry>) =>
    onPatch({ entries: s.entries.map((e) => (e.id === id ? { ...e, ...p } : e)) })

  return (
    <Section
      title={s.title || 'Untitled section'}
      icon={TYPE_ICON[s.type]}
      badge={count}
      defaultOpen={defaultOpen}
      dataSection={`custom-${s.id}`}
      openSignal={
        focusTarget?.kind === 'custom' && focusTarget.sectionId === s.id
          ? (focusTarget.id ?? focusTarget)
          : undefined
      }
      rename={{
        value: s.title,
        placeholder: 'Section title',
        onChange: (title) => onPatch({ title }),
      }}
      hidden={s.hidden}
      onToggleHidden={() => onPatch({ hidden: !s.hidden })}
    >
      <div className="space-y-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-2.5">
        <div>
          <FieldLabel>Layout</FieldLabel>
          <Segmented
            size="sm"
            options={SECTION_TYPES}
            value={s.type}
            onSelect={(type) => onPatch({ type })}
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <FieldLabel>
              Placement{' '}
              <span className="font-normal text-neutral-400">(two-column templates)</span>
            </FieldLabel>
            <Segmented
              size="sm"
              options={COLUMNS}
              value={s.column}
              onSelect={(column) => onPatch({ column })}
            />
          </div>
          <div className="flex shrink-0 items-center gap-1 pb-0.5">
            <IconButton label="Move section up" icon="arrowUp" disabled={!canMoveUp} onClick={() => onMove(-1)} />
            <IconButton
              label="Move section down"
              icon="arrowDown"
              disabled={!canMoveDown}
              onClick={() => onMove(1)}
            />
            <IconButton label="Delete section" icon="trash" danger onClick={onRemove} />
          </div>
        </div>
      </div>

      {(s.type === 'tags' || s.type === 'bullets') && (
        <>
          <LevelStylePicker
            value={s.levelStyle ?? 'none'}
            onChange={(levelStyle) => onPatch({ levelStyle })}
          />
          <ListEditor
            items={s.items}
            onChange={(items) =>
              onPatch({ items, levels: remapLevels(s.items, items, s.levels) })
            }
            placeholder={s.type === 'tags' ? 'e.g. Figma' : 'e.g. Won the 2023 hackathon'}
            addLabel={s.type === 'tags' ? 'Add tag' : 'Add bullet'}
            renderExtra={
              (s.levelStyle ?? 'none') === 'none'
                ? undefined
                : (item) => (
                    <LevelInput
                      value={s.levels?.[item.trim()] ?? 0}
                      onChange={(n) => onPatch({ levels: withLevel(s.levels, item, n) })}
                    />
                  )
            }
          />
        </>
      )}

      {s.type === 'text' && (
        <TextAreaField
          label="Content"
          value={s.text}
          onChange={(text) => onPatch({ text })}
          placeholder="Write anything — a paragraph, references, a note…"
          rows={5}
        />
      )}

      {s.type === 'entries' && (
        <>
          {s.entries.map((e, i) => (
            <ItemCard
              key={e.id}
              id={e.id}
              flash={focusTarget?.id === e.id}
              title={e.title || e.subtitle || `Entry ${i + 1}`}
              onRemove={() => onPatch({ entries: s.entries.filter((x) => x.id !== e.id) })}
              onMoveUp={() => onPatch({ entries: move(s.entries, i, i - 1) })}
              onMoveDown={() => onPatch({ entries: move(s.entries, i, i + 1) })}
              canMoveUp={i > 0}
              canMoveDown={i < s.entries.length - 1}
            >
              <TextField
                label="Title"
                value={e.title}
                onChange={(title) => patchEntry(e.id, { title })}
                placeholder="e.g. Open-source CLI"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <TextField
                  label="Subtitle"
                  value={e.subtitle}
                  onChange={(subtitle) => patchEntry(e.id, { subtitle })}
                  placeholder="Role, organization…"
                />
                <TextField
                  label="Date"
                  value={e.date}
                  onChange={(date) => patchEntry(e.id, { date })}
                  placeholder="2022 – Present"
                />
              </div>
              <TextAreaField
                label="Description"
                value={e.description}
                onChange={(description) => patchEntry(e.id, { description })}
                placeholder="Details, one bullet per line"
                hint="Each line becomes a bullet point."
                rows={3}
              />
            </ItemCard>
          ))}
          <AddButton
            label="Add entry"
            onClick={() =>
              onPatch({ entries: [...s.entries, blankCustomEntry(crypto.randomUUID())] })
            }
          />
        </>
      )}
    </Section>
  )
}

function AddSectionPicker({
  onAdd,
}: {
  onAdd: (preset: (typeof SECTION_PRESETS)[number]) => void
}) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 py-3.5 text-sm font-semibold text-blue-600 transition hover:border-blue-400 hover:bg-blue-50"
      >
        <UiIcon name="plus" strokeWidth={2.2} />
        Add custom section
      </button>
    )
  }

  return (
    <div className="panel-in rounded-2xl border border-blue-100 bg-white p-3.5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-800">Add a section</div>
          <div className="text-[11px] text-neutral-500">
            Pick a starting point — title, layout and placement can be changed later.
          </div>
        </div>
        <IconButton label="Close" icon="x" onClick={() => setOpen(false)} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {SECTION_PRESETS.map((p) => (
          <button
            key={p.label ?? p.title}
            type="button"
            onClick={() => {
              onAdd(p)
              setOpen(false)
            }}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2 py-2.5 text-center transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-card"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <UiIcon name={p.icon} />
            </span>
            <span className="text-xs font-semibold text-neutral-800">{p.label ?? p.title}</span>
            <span className="text-[10px] text-neutral-400">
              {SECTION_TYPES.find((t) => t.id === p.type)?.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
