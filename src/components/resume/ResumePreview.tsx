import type { CSSProperties } from 'react'
import {
  FONT_SIZES,
  FONT_STACKS,
  PAGE_DIMS,
  type DesignOptions,
  type ResumeData,
  type SectionKind,
} from '../../types'
import BannerTemplate from './BannerTemplate'
import ClassicTemplate from './ClassicTemplate'
import CompactTemplate from './CompactTemplate'
import ElegantTemplate from './ElegantTemplate'
import ExecutiveTemplate from './ExecutiveTemplate'
import LatexTemplate from './LatexTemplate'
import MinimalTemplate from './MinimalTemplate'
import ModernTemplate from './ModernTemplate'
import RightRailTemplate from './RightRailTemplate'
import SidebarTemplate from './SidebarTemplate'
import TimelineTemplate from './TimelineTemplate'

const TEMPLATES = {
  classic: ClassicTemplate,
  sidebar: SidebarTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  compact: CompactTemplate,
  elegant: ElegantTemplate,
  rightrail: RightRailTemplate,
  latex: LatexTemplate,
  executive: ExecutiveTemplate,
  banner: BannerTemplate,
  timeline: TimelineTemplate,
}

export default function ResumePreview({
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
  const Template = TEMPLATES[design.template]
  const dims = PAGE_DIMS[design.pageSize]

  const style = {
    '--accent': design.accentColor,
    fontFamily: FONT_STACKS[design.font],
    fontSize: FONT_SIZES[design.fontSize],
    width: dims.width,
    minHeight: dims.height,
  } as CSSProperties

  return (
    <div className="resume-page" style={style} data-contact-icons={design.contactIcons}>
      <Template resume={resume} onChange={onChange} onAdd={onAdd} />
    </div>
  )
}
