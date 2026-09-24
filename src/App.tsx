import { useEffect, useRef, useState } from 'react'
import DesignPanel from './components/DesignPanel'
import EditorPanel from './components/EditorPanel'
import ResumePreview from './components/resume/ResumePreview'
import { UiIcon, type UiIconName } from './components/ui'
import {
  blankCustomEntry,
  blankEducation,
  blankExperience,
} from './components/resume/utils'
import { defaultDesign, emptyResume, sampleResume } from './sampleData'
import type {
  DesignOptions,
  FocusTarget,
  PageSize,
  ResumeData,
  SectionKind,
} from './types'
import { usePersistentState } from './usePersistentState'

const PAGE_WIDTH_PX: Record<PageSize, number> = {
  a4: (210 * 96) / 25.4,
  letter: 8.5 * 96,
}

export default function App() {
  const [resume, setResume] = usePersistentState<ResumeData>(
    'resume:data',
    sampleResume,
    emptyResume,
  )
  const [design, setDesign] = usePersistentState<DesignOptions>(
    'resume:design',
    defaultDesign,
  )
  const [tab, setTab] = useState<'content' | 'design'>('content')
  const [focusTarget, setFocusTarget] = useState<FocusTarget>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  /** Add a new entry from the preview and reveal its fields in the side panel. */
  const addEntry = (kind: SectionKind, sectionId?: string) => {
    setTab('content')
    if (kind === 'custom' && sectionId) {
      // Only "entries" sections get a new blank entry; others just open in the panel.
      const section = resume.customSections.find((s) => s.id === sectionId)
      const id = section?.type === 'entries' ? crypto.randomUUID() : undefined
      if (id) {
        setResume((r) => ({
          ...r,
          customSections: r.customSections.map((s) =>
            s.id === sectionId ? { ...s, entries: [...s.entries, blankCustomEntry(id)] } : s,
          ),
        }))
      }
      setFocusTarget({ kind, sectionId, id })
    } else if (kind === 'experience' || kind === 'education') {
      const id = crypto.randomUUID()
      setResume((r) =>
        kind === 'experience'
          ? { ...r, experience: [...r.experience, blankExperience(id)] }
          : { ...r, education: [...r.education, blankEducation(id)] },
      )
      setFocusTarget({ kind, id })
    } else {
      setFocusTarget({ kind })
    }
  }

  // PDF filename comes from document.title in most browsers' "Save as PDF"
  useEffect(() => {
    const name = resume.personal.fullName.trim()
    document.title = name ? `${name} – Resume` : 'Resume Builder'
  }, [resume.personal.fullName])

  // Keep @page size in sync so the PDF matches the chosen format
  useEffect(() => {
    const id = 'resume-page-size'
    let el = document.getElementById(id) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = id
      document.head.appendChild(el)
    }
    el.textContent = `@page { size: ${design.pageSize === 'a4' ? 'A4' : 'letter'}; margin: 0; }`
  }, [design.pageSize])

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const name = resume.personal.fullName.trim().replace(/\s+/g, '-')
    a.download = `${name || 'resume'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text())
      if (!data || typeof data !== 'object' || !data.personal) {
        throw new Error('bad shape')
      }
      setResume({
        ...emptyResume,
        ...data,
        personal: { ...emptyResume.personal, ...data.personal },
      })
    } catch {
      alert('Could not import: that file is not a valid resume JSON export.')
    }
  }

  return (
    <>
      <div id="app-root" className="flex h-full flex-col gap-3 p-3">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 rounded-2xl border border-white/80 bg-white/80 px-3 shadow-float backdrop-blur-xl">
          <div className="flex items-center gap-3 pl-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-md ring-1 shadow-blue-600/30 ring-white/20 ring-inset">
              <UiIcon name="file" className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight text-neutral-900">
                Resume Builder
              </div>
              <div className="text-xs text-neutral-500">
                Design, edit &amp; export to PDF
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-full border border-neutral-200/70 bg-neutral-100/80 p-1">
              <HeaderButton icon="upload" onClick={() => fileRef.current?.click()}>
                Import JSON
              </HeaderButton>
              <HeaderButton icon="braces" onClick={exportJson}>
                Export JSON
              </HeaderButton>
              <HeaderButton icon="sparkles" onClick={() => setResume(sampleResume)}>
                Load sample
              </HeaderButton>
              <HeaderButton icon="trash" danger onClick={() => setResume(emptyResume)}>
                Clear
              </HeaderButton>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-full bg-linear-to-b from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md ring-1 shadow-blue-600/30 ring-blue-700/20 transition text-shadow-lift hover:-translate-y-px hover:from-blue-500 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-600/35 active:translate-y-0"
            >
              <UiIcon name="download" strokeWidth={2.2} />
              Download PDF
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 gap-3">
          <aside className="flex w-[420px] shrink-0 flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/70 shadow-float backdrop-blur-xl">
            <div className="p-3 pb-2">
              <div className="relative grid grid-cols-2 rounded-full border border-neutral-200/70 bg-neutral-100/80 p-1">
                <span
                  aria-hidden
                  className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm ring-1 ring-neutral-900/5 transition-transform duration-300 ease-out ${
                    tab === 'design' ? 'translate-x-full' : ''
                  }`}
                />
                {(['content', 'design'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`relative flex items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold capitalize transition-colors ${
                      tab === t ? 'text-blue-600' : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <UiIcon name={t === 'content' ? 'pencil' : 'palette'} />
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="soft-scroll flex-1 overflow-y-auto px-3 pt-1 pb-3">
              {tab === 'content' ? (
                <EditorPanel
                  resume={resume}
                  onChange={setResume}
                  focusTarget={focusTarget}
                />
              ) : (
                <DesignPanel design={design} onChange={setDesign} />
              )}
            </div>
          </aside>

          <PreviewPane
            resume={resume}
            design={design}
            onChange={setResume}
            onAdd={addEntry}
          />
        </div>
      </div>

      {/* Separate copy rendered only when printing — avoids transform/layout issues */}
      <div id="print-root">
        <ResumePreview
          resume={resume}
          design={design}
          onChange={setResume}
          onAdd={addEntry}
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) importJson(f)
          e.target.value = ''
        }}
      />
    </>
  )
}

function HeaderButton({
  icon,
  onClick,
  danger,
  children,
}: {
  icon: UiIconName
  onClick: () => void
  danger?: boolean
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={children}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-white hover:shadow-sm ${
        danger ? 'hover:text-red-600' : 'hover:text-neutral-900'
      }`}
    >
      <UiIcon name={icon} />
      <span className="hidden xl:inline">{children}</span>
    </button>
  )
}

function PreviewPane({
  resume,
  design,
  onChange,
  onAdd,
}: {
  resume: ResumeData
  design: DesignOptions
  onChange: (r: ResumeData) => void
  onAdd: (section: SectionKind, sectionId?: string) => void
}) {
  const mainRef = useRef<HTMLElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const update = () => {
      const pageW = PAGE_WIDTH_PX[design.pageSize]
      setScale(Math.min(1, (main.clientWidth - 64) / pageW))
    }
    const ro = new ResizeObserver(update)
    ro.observe(main)
    update()
    return () => ro.disconnect()
  }, [design.pageSize])

  return (
    <main
      ref={mainRef}
      className="preview-canvas soft-scroll flex-1 overflow-auto rounded-3xl border border-white/70 px-8 pt-6 pb-12 shadow-[inset_0_1px_3px_rgb(15_23_42/0.06)]"
    >
      <p className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-white bg-white/85 py-1.5 pr-3.5 pl-1.5 text-xs text-neutral-600 shadow-card backdrop-blur">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <UiIcon name="pencil" className="h-3 w-3" strokeWidth={2.2} />
        </span>
        Click any text on the resume to edit it directly
      </p>
      <div className="mx-auto w-fit" style={{ zoom: scale }}>
        <ResumePreview
          resume={resume}
          design={design}
          onChange={onChange}
          onAdd={onAdd}
        />
      </div>
    </main>
  )
}
