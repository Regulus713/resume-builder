import {
  useRef,
  useState,
  type ClipboardEvent,
  type ElementType,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { flushSync } from 'react-dom'

/* ---------- caret / selection helpers ---------- */

function caretOffset(el: HTMLElement): number {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return 0
  const range = sel.getRangeAt(0)
  const pre = range.cloneRange()
  pre.selectNodeContents(el)
  pre.setEnd(range.endContainer, range.endOffset)
  return pre.toString().length
}

function setCaretOffset(el: HTMLElement, offset: number) {
  el.focus()
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let remaining = offset
  let node = walker.nextNode()
  while (node) {
    const len = node.textContent?.length ?? 0
    if (len >= remaining) {
      range.setStart(node, remaining)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
      return
    }
    remaining -= len
    node = walker.nextNode()
  }
  range.selectNodeContents(el)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)
}

function insertPlainText(text: string) {
  try {
    if (document.execCommand('insertText', false, text)) return
  } catch {
    // fall through to manual insertion
  }
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)
  range.deleteContents()
  const node = document.createTextNode(text)
  range.insertNode(node)
  range.setStartAfter(node)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

/* ---------- EditableText ---------- */

interface EditableTextProps {
  as?: ElementType
  value: string
  onChange: (v: string) => void
  onCommit?: (v: string) => void
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void
  onPasteText?: (e: ClipboardEvent<HTMLElement>) => void
  className?: string
  placeholder?: string
  multiline?: boolean
  domProps?: Record<string, string>
}

export function EditableText({
  as: Tag = 'span',
  value,
  onChange,
  onCommit,
  onKeyDown,
  onPasteText,
  className = '',
  placeholder,
  multiline = false,
  domProps,
}: EditableTextProps) {
  // While focused, render the value captured at focus time so React never
  // rewrites the DOM node the user is typing into (which would reset the caret).
  const [focused, setFocused] = useState(false)
  const [frozen, setFrozen] = useState(value)

  return (
    <Tag
      {...domProps}
      className={`editable ${className}`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder ?? ''}
      onFocus={() => {
        setFrozen(value)
        setFocused(true)
      }}
      onBlur={(e: FocusEvent<HTMLElement>) => {
        setFocused(false)
        const text = multiline
          ? e.currentTarget.innerText
          : (e.currentTarget.textContent ?? '')
        onCommit?.(text)
      }}
      onInput={(e: FormEvent<HTMLElement>) => {
        const el = e.currentTarget
        if (!el.textContent?.trim() && !multiline) el.innerHTML = ''
        onChange(multiline ? el.innerText.replace(/\n$/, '') : (el.textContent ?? ''))
      }}
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(e)
        if (e.defaultPrevented) return
        if (e.key === 'Enter' && !multiline) {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
      onPaste={(e: ClipboardEvent<HTMLElement>) => {
        onPasteText?.(e)
        if (e.defaultPrevented) return
        e.preventDefault()
        let text = e.clipboardData.getData('text/plain')
        if (!multiline) text = text.replace(/\s*\n\s*/g, ' ')
        insertPlainText(text)
      }}
    >
      {focused ? frozen : value}
    </Tag>
  )
}

/* ---------- EditableLines (bullet list, one item per line) ---------- */

export function EditableLines({
  lines,
  onChange,
  className = '',
  placeholder = 'Click to add details',
}: {
  lines: string[]
  onChange: (lines: string[]) => void
  className?: string
  placeholder?: string
}) {
  const ref = useRef<HTMLUListElement>(null)

  const display = lines.length ? lines : ['']

  /** Commit new lines, then focus a specific line after the DOM updates. */
  const commit = (next: string[], focus?: { idx: number; offset: number }) => {
    if (focus) {
      flushSync(() => onChange(next))
      const el = ref.current?.querySelector<HTMLElement>(
        `[data-line="${focus.idx}"]`,
      )
      if (el) setCaretOffset(el, focus.offset)
    } else {
      onChange(next)
    }
  }

  const setLine = (i: number, v: string) => {
    const next = [...display]
    next[i] = v
    commit(next)
  }

  const handleKey = (e: KeyboardEvent<HTMLElement>, i: number) => {
    const el = e.currentTarget
    if (e.key === 'Enter') {
      e.preventDefault()
      const pos = caretOffset(el)
      const text = display[i]
      if (text === '') return // don't create stray empty lines
      const next = [...display]
      next[i] = text.slice(0, pos)
      next.splice(i + 1, 0, text.slice(pos))
      commit(next, { idx: i + 1, offset: 0 })
    } else if (e.key === 'Backspace' && caretOffset(el) === 0 && i > 0) {
      // merge into previous line
      e.preventDefault()
      const prevLen = display[i - 1].length
      const next = [...display]
      next[i - 1] = display[i - 1] + display[i]
      next.splice(i, 1)
      commit(next, { idx: i - 1, offset: prevLen })
    } else if (e.key === 'Backspace' && display[i] === '' && display.length === 1) {
      e.preventDefault()
      commit([])
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLElement>, i: number) => {
    const text = e.clipboardData.getData('text/plain')
    if (!/\n/.test(text)) return // single-line paste: default handler is fine
    e.preventDefault()
    const pasted = text.replace(/\r/g, '').split('\n')
    const cur = display[i]
    const pos = caretOffset(e.currentTarget)
    const next = [...display]
    next[i] = cur.slice(0, pos) + pasted[0]
    next.splice(
      i + 1,
      0,
      ...pasted.slice(1, -1),
      pasted[pasted.length - 1] + cur.slice(pos),
    )
    commit(next, {
      idx: i + pasted.length - 1,
      offset: pasted[pasted.length - 1].length,
    })
  }

  const handleCommit = (i: number, v: string) => {
    if (v.trim() !== '') return
    if (lines.length <= 1) {
      if (lines.length === 1) commit([])
      return
    }
    commit(lines.filter((_, j) => j !== i))
  }

  return (
    <ul ref={ref} className={className}>
      {display.map((line, i) => (
        <li
          key={i}
          data-line={i}
          className={`min-h-[1em] ${line.trim() ? '' : 'print:hidden'}`}
        >
          <EditableText
            value={line}
            placeholder={lines.length === 0 ? placeholder : ''}
            onChange={(v) => setLine(i, v)}
            onKeyDown={(e) => handleKey(e, i)}
            onPasteText={(e) => handlePaste(e, i)}
            onCommit={(v) => handleCommit(i, v)}
          />
        </li>
      ))}
    </ul>
  )
}

/* ---------- EditableChips (skills) ---------- */

export function EditableChips({
  skills,
  onChange,
  chipClassName = '',
  onAdd,
  placeholder = 'Skill',
}: {
  skills: string[]
  onChange: (skills: string[]) => void
  chipClassName?: string
  onAdd?: () => void
  placeholder?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const setChip = (i: number, v: string) => {
    const next = [...skills]
    next[i] = v
    onChange(next)
  }

  /** Commit new skills, then focus a specific chip after the DOM updates. */
  const commitAndFocus = (next: string[], idx: number, offset: number) => {
    flushSync(() => onChange(next))
    const el = ref.current?.querySelector<HTMLElement>(`[data-chip="${idx}"]`)
    if (el) setCaretOffset(el, offset)
  }

  return (
    <div ref={ref} className="flex flex-wrap gap-[0.4em]">
      {skills.map((s, i) => (
        <EditableText
          key={i}
          domProps={{ 'data-chip': String(i) }}
          value={s}
          placeholder={placeholder}
          className={`${chipClassName} ${s.trim() ? '' : 'print:hidden'}`}
          onChange={(v) => setChip(i, v)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const next = [...skills]
              next.splice(i + 1, 0, '')
              commitAndFocus(next, i + 1, 0)
              onAdd?.()
            } else if (e.key === 'Backspace' && s === '' && skills.length > 1) {
              e.preventDefault()
              const next = skills.filter((_, j) => j !== i)
              const t = Math.max(0, i - 1)
              commitAndFocus(next, t, next[t]?.length ?? 0)
            }
          }}
          onCommit={(v) => {
            if (v.trim() === '') onChange(skills.filter((_, j) => j !== i))
          }}
        />
      ))}
      <button
        type="button"
        onClick={() => {
          commitAndFocus([...skills, ''], skills.length, 0)
          onAdd?.()
        }}
        className={`${chipClassName} border-dashed opacity-60 transition-opacity hover:opacity-100 print:hidden`}
      >
        + Add
      </button>
    </div>
  )
}
