import { useEffect, useRef, useState } from 'react'
import DesignPanel from './components/DesignPanel'
import EditorPanel from './components/EditorPanel'
import ResumePreview from './components/resume/ResumePreview'
import { blankEducation, blankExperience } from './components/resume/utils'
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
  )
  const [design, setDesign] = usePersistentState<DesignOptions>(
    'resume:design',
    defaultDesign,
  )
  const [tab, setTab] = useState<'content' | 'design'>('content')
  const [focusTarget, setFocusTarget] = useState<FocusTarget>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  /** Add a new entry from the preview and reveal its fields in the side panel. */
  const addEntry = (kind: SectionKind) => {
    setTab('content')
    if (kind === 'experience' || kind === 'education') {
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
      <div id="app-root" className="flex h-full flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">
              R
            </span>
            <span className="text-sm font-semibold text-neutral-800">
              Resume Builder
            </span>
          </div>
          <div className="flex items-center gap-2">
            <HeaderButton onClick={() => fileRef.current?.click()}>
              Import JSON
            </HeaderButton>
            <HeaderButton onClick={exportJson}>Export JSON</HeaderButton>
            <HeaderButton onClick={() => setResume(sampleResume)}>
              Load sample
            </HeaderButton>
            <HeaderButton onClick={() => setResume(emptyResume)}>
              Clear
            </HeaderButton>
            <button
              type="button"
              onClick={() => window.print()}
              className="ml-1 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Download PDF
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-[400px] shrink-0 flex-col border-r border-neutral-200 bg-white">
            <div className="flex border-b border-neutral-200">
              {(['content', 'design'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
                    tab === t
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
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
  onClick,
  children,
}: {
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
    >
      {children}
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
  onAdd: (section: SectionKind) => void
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
      className="flex-1 overflow-auto bg-neutral-200/70 px-8 py-10"
    >
      <p className="mx-auto mb-4 w-fit text-xs text-neutral-400">
        Tip: click any text on the resume to edit it directly
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
