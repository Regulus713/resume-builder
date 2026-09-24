import { Fragment, type ReactNode } from 'react'
import type { CustomSection, ResumeData, SectionColumn, SectionKind } from '../../types'
import { EditableChips, EditableLines, EditableText } from './Editable'
import { LevelList } from './Level'
import { AddRow, EditableHeading } from './shared'
import { customHasContent, entryHasContent, updaters, withLevel } from './utils'

/** How a template styles custom sections (per column). */
export interface CustomTheme {
  /**
   * Render one section (heading + body) in the template's style. Called as a
   * plain function, so element types stay stable and the caret survives edits.
   * Apply `className` to the root element (it hides empty sections in print).
   */
  section: (p: { title: ReactNode; body: ReactNode; className: string; section: CustomSection }) => ReactNode
  /** Chip class for "tags"; omit to render tags inline as "a · b · c" using `text`. */
  chip?: string
  /** Separator for inline tags (default " · "). */
  tagSeparator?: string
  /** Paragraph class (text sections and inline tags). */
  text: string
  /** `<ul>` class for bullet sections. */
  bullets: string
  entry: {
    wrap: string
    title: string
    subtitle: string
    date: string
    bullets: string
    /** Put the date under the title (narrow columns). */
    stacked?: boolean
  }
  /** AddRow on a dark background; level indicators then use the text color. */
  dark?: boolean
  /** Level indicator color class (default: the accent; '' = text color). */
  levelColor?: string
}

export default function CustomSections({
  resume,
  onChange,
  onAdd,
  column,
  theme,
  includeLanguages = true,
}: {
  resume: ResumeData
  onChange: (r: ResumeData) => void
  onAdd: (kind: SectionKind, sectionId?: string) => void
  /** Which column to render; single-column templates pass "all". */
  column: SectionColumn | 'all'
  theme: CustomTheme
  /** Render the built-in Languages section (off for templates that place it themselves). */
  includeLanguages?: boolean
}) {
  const up = updaters(resume, onChange)
  const sections = resume.customSections.filter(
    (s) => !s.hidden && (column === 'all' || s.column === column),
  )

  /** Tags as the template's chips, or inline "a · b" text when it has none. */
  const tags = (
    items: string[],
    onItems: (items: string[]) => void,
    placeholder: string,
    onAddChip?: () => void,
  ) =>
    theme.chip ? (
      <EditableChips
        skills={items}
        onChange={onItems}
        onAdd={onAddChip}
        chipClassName={theme.chip}
        placeholder={placeholder}
      />
    ) : (
      <EditableText
        as="p"
        multiline
        value={items.filter((x) => x.trim()).join(theme.tagSeparator ?? ' · ')}
        onChange={(v) =>
          onItems(
            v
              .split(/[·,\n]+/)
              .map((x) => x.trim())
              .filter(Boolean),
          )
        }
        placeholder={`${placeholder} · ${placeholder} · ${placeholder}`}
        className={`block ${theme.text}`}
      />
    )

  // Built-in Languages renders here too (side column / single-column flow)
  // for templates that don't place it themselves.
  const langStyle = up.levelStyle('languages')
  const languages =
    includeLanguages && up.shown('languages') && (column === 'all' || column === 'side') ? (
      <Fragment key="languages">
        {theme.section({
          title: <EditableHeading {...up.title('languages', 'Languages')} />,
          body:
            langStyle === 'none' ? (
              tags(resume.languages, up.list('languages'), 'Language')
            ) : (
              <LevelList
                {...up.levelList('languages')}
                style={langStyle}
                theme={theme}
                placeholder="Language"
              />
            ),
          section: {
            id: 'languages',
            title: 'Languages',
            type: 'tags',
            column: 'side',
            hidden: false,
            items: resume.languages,
            entries: [],
            text: '',
          },
          className: resume.languages.some((l) => l.trim()) ? '' : 'print:hidden',
        })}
      </Fragment>
    ) : null

  const custom = sections.map((s) => {
    const set = up.custom(s.id)
    const setItems = up.customItems(s.id)
    const levelStyle = s.levelStyle ?? 'none'
    const title = (
      <EditableText
        value={s.title}
        onChange={(v) => set({ title: v })}
        placeholder="Section title"
      />
    )
    let body: ReactNode
    switch (s.type) {
      case 'tags':
      case 'bullets':
        body =
          levelStyle !== 'none' ? (
            <LevelList
              items={s.items}
              levels={s.levels ?? {}}
              style={levelStyle}
              labels="generic"
              onItems={setItems}
              onLevel={(item, level) => set({ levels: withLevel(s.levels, item, level) })}
              theme={theme}
            />
          ) : s.type === 'tags' ? (
            tags(s.items, setItems, 'Item', () => onAdd('custom', s.id))
          ) : (
            <EditableLines
              lines={s.items}
              onChange={setItems}
              className={theme.bullets}
              placeholder="Add a bullet point"
            />
          )
        break
      case 'text':
        body = (
          <EditableText
            as="p"
            multiline
            value={s.text}
            onChange={(text) => set({ text })}
            placeholder="Write something…"
            className={`block whitespace-pre-line ${theme.text}`}
          />
        )
        break
      case 'entries':
        body = (
          <div>
            {s.entries.map((e) => {
              const setE = up.customEntry(s.id, e.id)
              const date = (
                <EditableText
                  value={e.date}
                  onChange={(date) => setE({ date })}
                  placeholder="Date"
                  className={`shrink-0 ${theme.entry.date} ${
                    theme.entry.stacked ? 'block' : ''
                  } ${e.date ? '' : 'print:hidden'}`}
                />
              )
              return (
                <div
                  key={e.id}
                  className={`break-inside-avoid ${theme.entry.wrap} ${
                    entryHasContent(e) ? '' : 'print:hidden'
                  }`}
                >
                  <div
                    className={
                      theme.entry.stacked
                        ? ''
                        : 'flex items-baseline justify-between gap-[1em]'
                    }
                  >
                    <EditableText
                      value={e.title}
                      onChange={(title) => setE({ title })}
                      placeholder="Title"
                      className={`${theme.entry.title} ${theme.entry.stacked ? 'block' : ''}`}
                    />
                    {!theme.entry.stacked && date}
                  </div>
                  <EditableText
                    value={e.subtitle}
                    onChange={(subtitle) => setE({ subtitle })}
                    placeholder="Subtitle"
                    className={`block ${theme.entry.subtitle} ${
                      e.subtitle ? '' : 'print:hidden'
                    }`}
                  />
                  {theme.entry.stacked && date}
                  <EditableLines
                    lines={e.description ? e.description.split('\n') : []}
                    onChange={(lines) => setE({ description: lines.join('\n') })}
                    className={theme.entry.bullets}
                    placeholder="Add a bullet point"
                  />
                </div>
              )
            })}
            <AddRow label="Add entry" onClick={() => onAdd('custom', s.id)} dark={theme.dark} />
          </div>
        )
        break
    }
    return (
      <Fragment key={s.id}>
        {theme.section({
          title,
          body,
          section: s,
          className: customHasContent(s) ? '' : 'print:hidden',
        })}
      </Fragment>
    )
  })

  return (
    <>
      {languages}
      {custom}
    </>
  )
}
