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

## How printing/PDF works

- `#print-root` renders a second copy of `ResumePreview`, `display:none` on
  screen and shown only under `@media print`; `#app-root` is hidden in print.
- `@page` size/margin is injected by an effect in `App.tsx` from
  `design.pageSize` (A4 / US Letter, margin 0 for full-bleed colors).
- `print-color-adjust: exact` on `.resume-page` keeps accent colors in the PDF.
- `document.title` is set to "<Name> – Resume" so Save-as-PDF gets a good
  filename.

## Conventions

- Resume templates size everything in `em` (`text-[0.85em]` etc.) so the
  font-size option scales the whole document from `.resume-page`'s fontSize.
- Accent color reaches templates via the `--accent` CSS var, e.g.
  `text-(--accent)`, `bg-(--accent)/10`, `border-(--accent)`.
- On-screen preview scales via `zoom` (see `PreviewPane` in `App.tsx`); the
  print copy is unaffected since it is a separate tree.
- Keep non-component exports out of `.tsx` files that export components
  (oxlint `react(only-export-components)`) — helpers live in `utils.ts`.
