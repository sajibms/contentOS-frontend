import type { YooEditor, YooptaBlock } from '@yoopta/editor'
import type { JSX } from 'react'

export type ToolbarRenderProps = {
  activeBlock?: YooptaBlock
  editor: YooEditor
  toggleHoldToolbar?: (hold: boolean) => void
}

export type ToolbarToolProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (props: any) => JSX.Element
}
