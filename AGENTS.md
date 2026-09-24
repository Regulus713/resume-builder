# Resume Builder

Interactive resume builder: users fill in their details, customize the design
(template, accent color, font, size, page format), and download a PDF via the
browser print dialog.

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin in `vite.config.ts`)
- No router / no backend — state lives in React state + `localStorage`

## Commands

- `npm run dev` — dev server (http://localhost:5173)
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run lint` — oxlint

Note: on this machine the `npm`/`npx` PowerShell shims are blocked by the
script execution policy — use `npm.cmd` / `npx.cmd` instead.

## Structure

- `src/types.ts` — `ResumeData`, `DesignOptions`, font/page constants
- `src/sampleData.ts` — `sampleResume`, `emptyResume`, `defaultDesign`
- `src/usePersistentState.ts` — useState synced to localStorage
- `src/components/EditorPanel.tsx` — content form (left panel, "Content" tab)
- `src/components/DesignPanel.tsx` — customization controls ("Design" tab)
- `src/components/resume/` — `ResumePreview` dispatcher + 11 templates
  (Classic, Sidebar, Modern, Minimal, Compact, Elegant, RightRail, LaTeX,
  Executive, Banner, Timeline);
  `utils.ts` (helpers) and `shared.tsx` (Icon, SectionHeading, AddRow)
- `src/App.tsx` — layout, header actions, print wiring, preview scaling

## Inline editing (contentEditable)

Every text field on the preview is directly editable — click and type.

- `src/components/resume/Editable.tsx` — `EditableText` (single/multi-line),
  `EditableLines` (per-bullet editing: Enter splits at caret, Backspace at
  position 0 merges, multi-line paste splits into bullets, emptied lines are
  removed on blur), `EditableChips` (skill chips with an `+ Add` chip).
- Caret safety: `EditableText` freezes its rendered children while focused so
  React never rewrites the node being typed into. Focus-after-insert uses
  `flushSync` + `data-line`/`data-chip` attributes, not effects.
- Empty fields render `data-placeholder` ghosts via `.editable:empty::before`
  (screen only — suppressed in `@media print`). Editing affordances
  (`+ Add …` buttons, empty sections, empty contact fields) carry
  `print:hidden` so the PDF stays clean.
- `contactItems` returns ALL five contact fields; empty ones show as ghosts
  on screen so users can fill them without opening the form.
- `AddRow` (in `shared.tsx`) is the dashed "add entry" button shown under
  Experience/Education in the preview — screen only.
- Preview adds go through `App.addEntry(kind)` (`SectionKind` =
  experience/education/skills): it creates the entry, switches the sidebar to
  the Content tab, and sets `focusTarget`. `EditorPanel` opens the matching
  `Section` via its `openSignal` prop (adjust-state-during-render), then
  scrolls to the `panel-item-<id>` card (`.entry-flash` animation) and focuses
  its first input.
- Templates call `updaters(resume, onChange)` from `utils.ts` to get curried
  per-field writers (`up.personal('email')`, `up.exp(id)`, `up.edu(id)`).
  `endDatePatch` maps typed "Present"/"Current"/"Now" back to the `current`
  flag.

## Custom sections, custom fields, section control

- Data (`types.ts`): `customFields` (label/value contact fields),
  `customSections` (`CustomSection`: `type` = tags | bullets | entries | text,
  `column` = main | side, `hidden`; `items`/`entries`/`text` are all stored so
  switching `type` is lossless), `sectionTitles` (built-in heading overrides;
  missing = template default) and `hiddenSections` (built-in ids).
- `usePersistentState(key, initial, mergeBase)`: resume data merges old saves
  over `emptyResume` (not the sample) so demo sections don't leak in.
- Templates: `contactItems(resume, onChange)` returns built-in + custom fields
  with their own `onChange`. Built-in headings use
  `<EditableHeading {...up.title('skills', 'Skills')} />`; built-in section
  roots get `hidden={!up.shown('skills')}` (the `hidden` attribute, so no
  re-indenting). Custom sections render via
  `<CustomSections column="all" | "main" | "side" theme={…} />`; each template
  defines module-level `CustomTheme` objects (a `section` render function
  reproducing its heading style + chip/bullet/entry classes). Single-column
  templates use `"all"`; two-column ones render `"side"` in the rail and
  `"main"` in the main column.
- Preview "+ Add entry" in a custom section calls `onAdd('custom', sectionId)`.
- Panel: `ui.tsx` `Section` supports `rename` (pencil / double-click) and
  `onToggleHidden` (eye). `ListEditor` edits string lists (Enter adds, Backspace
  on empty removes, Alt+↑/↓ reorders, empties pruned on blur). Presets and
  type metadata live in `components/sectionPresets.ts`.
- Contact icons: `resume/brandIcons.ts` holds brand logos (GitHub, Gmail,
  Facebook, X, …) as fill paths from Simple Icons (CC0; LinkedIn/CodePen/
  Outlook from the v10.0.0 release since they were removed upstream), each
  with a `match` regex. `autoContactIcon(key, label, value)` in `utils.ts`
  picks an icon from the label/value; `resume.contactIcons[key]` stores user
  overrides (key = built-in field name or custom field id). `Icon` in
  `shared.tsx` renders both outline and brand icons.
- Design → Contact icons (`design.contactIcons`: template | show | hide) is
  applied via `data-contact-icons` on `.resume-page` + CSS in `index.css`:
  every contact icon carries `contact-icon`; templates designed without icons
  render `<OptionalContactIcon>` (class `contact-icon-optional`), shown only
  in "show" mode. The panel's `IconPicker.tsx` is the searchable picker.
- Levels (1–5): `LevelStyle` = none | stars | dots ("Bulbs") | bar ("Slider")
  | blocks | text ("Words"). Per-section style in `resume.levelStyles`
  (skills / languages / education); item levels in `resume.levels.skills` /
  `.languages`, keyed by trimmed item text; education uses
  `EducationItem.level`; custom tag/bullet sections carry their own
  `levelStyle` + `levels`. Always write lists through `up.list('skills')` /
  `up.customItems(id)` — they call `remapLevels` so a level follows its item
  through renames and drops with it on delete.
- `resume/Level.tsx`: `LevelIndicator` (interactive: click/hover, arrow
  keys, click current level to clear; unset = screen-only ghost),
  `LevelList` (name + indicator rows styled from the template's
  `CustomTheme`; 1 column when `entry.stacked`, else 2; `theme.levelColor`
  overrides the accent, `dark` inherits text color), `EducationLevel`.
  Templates switch skills via `skillStyle === 'none' ? existing : <LevelList>`.
- Built-in Languages is rendered by `<CustomSections>` (side column /
  single-column flow) in every template except Timeline, which places it in
  its rail and passes `includeLanguages={false}`.
- Panel: `LevelControls.tsx` (`LevelStylePicker` with live previews,
  `LevelInput` bulbs) + `ListEditor`'s `renderExtra` slot.
- Vite's watcher can miss edits made by external tools; if the preview looks
  stale, restart the dev server (kill the `node … vite` process on :5173 —
  killing the npm shell alone leaves it running).

## How printing/PDF works

- `#print-root` renders a second copy of `ResumePreview`, `display:none` on
  screen and shown only under `@media print`; `#app-root` is hidden in print.
- `@page` size/margin is injected by an effect in `App.tsx` from
  `design.pageSize` (A4 / US Letter, margin 0 for full-bleed colors).
- `print-color-adjust: exact` on `.resume-page` keeps accent colors in the PDF.
- `document.title` is set to "<Name> – Resume" so Save-as-PDF gets a good
  filename.

## App UI (chrome) styling

- Floating, rounded layout: glass header (`rounded-2xl`), sidebar card
  (`rounded-3xl`), dotted preview canvas (`.preview-canvas`, `rounded-3xl`).
- Theme tokens in `index.css` `@theme`: `shadow-card`, `shadow-float`,
  `text-shadow-soft`, `text-shadow-lift` (use `lift` for white text on color).
- A small text shadow is applied to all of `#app-root`; `.resume-page` resets
  it to `none` so the document (and PDF) stays crisp. On screen the page gets
  rounded corners + layered shadow via `@media screen` only.
- `ui.tsx` exports `UiIcon` (stroke icon set, `UiIconName`), inputs,
  `Section` (card with `icon` + optional `badge` count), `ItemCard`,
  `AddButton`. Pill shapes (`rounded-full`) for buttons/segmented controls,
  `rounded-xl`/`rounded-2xl` for inputs and cards.
- Screenshots for visual checks: headless Chrome at
  `C:\Program Files\Google\Chrome\Application\chrome.exe --headless=new --screenshot`.

## Conventions

- Resume templates size everything in `em` (`text-[0.85em]` etc.) so the
  font-size option scales the whole document from `.resume-page`'s fontSize.
- Accent color reaches templates via the `--accent` CSS var, e.g.
  `text-(--accent)`, `bg-(--accent)/10`, `border-(--accent)`.
- On-screen preview scales via `zoom` (see `PreviewPane` in `App.tsx`); the
  print copy is unaffected since it is a separate tree.
- Keep non-component exports out of `.tsx` files that export components
  (oxlint `react(only-export-components)`) — helpers live in `utils.ts`.
