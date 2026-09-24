# Handoff

## What this is

A browser-based resume builder: users edit resume content, customize the
design across 11 templates, and download a PDF via the browser print pipeline.
No backend — all state lives in `localStorage`, with JSON import/export.

## Run it

```powershell
npm.cmd install
npm.cmd run dev      # http://localhost:5173
npm.cmd run lint     # oxlint
npm.cmd run build    # tsc -b && vite build
```

On Windows PowerShell use `npm.cmd`/`npx.cmd` — the `npm.ps1` shim is blocked
by execution policy.

## State of the project

Fully working. Everything below is implemented and verified (lint + build clean):

- **11 templates**: Classic, Sidebar, Modern, Minimal, Compact, Elegant,
  RightRail, LaTeX, Executive, Banner, Timeline. Picked in the Design tab.
  Timeline replicates the structure of a reference PDF (`Raid_Boudra_CV.pdf`,
  untracked — contains personal info): dark accent header band, gray left
  rail (Contact / Skills / Languages), timeline spine with icon badges.
- **Inline editing**: click any text in the preview to edit (contentEditable).
  Ghost placeholders for empty fields; `EditableLines` for bullet lists;
  `EditableChips` for skills.
- **Add from preview**: dashed `+ Add` rows under Experience/Education create
  the entry *and* reveal it in the sidebar (tab switch → section opens →
  scroll → flash → focus). See `App.addEntry` + `EditorPanel focusTarget`.
- **Custom sections**: users can add arbitrary sections (paragraph, bullets,
  tags, or dated entries), rename/reorder/hide them, and add custom fields.
  Built-in section headings are renamable and hideable (eye toggle).
  `CustomSections.tsx` renders them in every template via a `CustomTheme`.
- **Custom contact fields + icons**: extra header fields (e.g. GitHub) with
  automatic brand-icon detection plus a manual searchable `IconPicker`;
  per-field display mode template/show/hide (`resume.contactIcons`,
  `design.contactIcons` default `'template'`).
- **Level indicators (1–5)**: skills, languages, education and custom
  tag/bullet sections can display Stars / Bulbs / Slider / Blocks / Words
  instead of text ("English ★★★★★" instead of "Fluent"). Levels are keyed by
  item text and follow renames (`remapLevels`). Set them in the panel
  (`LevelControls.tsx`) or click/hover/arrow-key the indicators in the
  preview (`Level.tsx`).
- **UI polish**: glass header, rounded panels/inputs, layered shadows, dotted
  preview canvas — all screen-only; print output is unaffected.
- **Design options**: accent color (8 presets + custom), font (4), font size
  (3), page size (A4/Letter).
- **PDF**: "Download PDF" → `window.print()`; a clean print-only copy renders
  in `#print-root` (no ghosts/buttons), `@page` size follows the setting,
  `document.title` feeds the suggested filename.
- **Data model**: `ResumeData` in `src/types.ts` — personal, summary,
  experience[], education[], skills[], languages[], plus `customFields`,
  `customSections`, `sectionTitles`, `hiddenSections`, `contactIcons`,
  `levels`, `levelStyles`. `usePersistentState` merges stored state over
  `emptyResume` so new fields don't break old saves.

## Architecture notes

Read `AGENTS.md` first — it documents the contentEditable caret-preservation
approach, the `updaters()` pattern, the level/theme plumbing, print pipeline,
and file map.

## Not implemented (possible next steps)

- Undo/redo, drag-to-reorder in preview
- Levels for custom *entry* sections (currently only tag/bullet items)
- One-click PDF via a library (jsPDF/html2pdf) instead of the print dialog
- Light-accent contrast handling for solid-color rails (RightRail, Timeline band)
- Auth / cloud persistence (currently localStorage only)
