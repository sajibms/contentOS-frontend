import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import * as Toolbar from '@radix-ui/react-toolbar'
import { useFloating, offset, flip, shift, inline, autoUpdate } from '@floating-ui/react'

import { HighlightColor } from './HighlightColor'
import {
  findSlateBySelectionPath,
  HOTKEYS,
  type SlateElement,
  useYooptaTools,
  UI,
  Blocks,
  findPluginBlockByPath,
  type YooptaBlockData,
} from '@yoopta/editor'
import { Editor, Element, type NodeEntry, Range, Transforms } from 'slate'
// import { ToolbarRenderProps } from './types'
import { buildActionMenuRenderProps } from './utils'
import RedoSvg from './icons/RedoSvg'
import UndoSvg from './icons/UndoSvg'
import BoldSvg from './icons/BoldSvg'
import ItalicSvg from './icons/ItalicSvg'
import UnderlineSvg from './icons/UnderlineSvg'
import StrikeSvg from './icons/StrikeSvg'
import CodeSvg from './icons/CodeSvg'
import TextAlignSvg from './icons/TextAlignSvg'
import ColorSvg from './icons/ColorSvg'
import LinkSvg from './icons/LinkSvg'
import { useEffect, useRef, useState } from 'react'

const { Overlay, Portal } = UI

type LinkValues = {
  title?: string
  url: string
  target?: string
  rel?: string
}

const DEFAULT_LINK_VALUE: LinkValues = {
  title: '',
  url: '',
  target: '_self',
  rel: 'noreferrer',
}

// const ALIGN_ICONS = {
//   left: TextAlignLeftIcon,
//   center: TextAlignCenterIcon,
//   right: TextAlignRightIcon,
// };

const getLinkEntry = slate => {
  const [link] = Editor.nodes(slate, {
    match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as SlateElement).type === 'link',
  })

  return link
}

const DEFAULT_MODALS = { link: false, highlight: false, actionMenu: false }
type ModalsState = typeof DEFAULT_MODALS

const DefaultToolbarRender = ({ activeBlock, editor, toggleHoldToolbar }: any) => {
  const [modals, setModals] = useState<ModalsState>({
    link: false,
    highlight: false,
    actionMenu: false,
  })
  const [linkValues, setLinkValues] = useState<LinkValues>(DEFAULT_LINK_VALUE)
  const lastSelection = useRef<Range | null>(null)

  const tools = useYooptaTools()

  const onChangeModal = (modal: keyof ModalsState, value: boolean) => {
    setModals(() => ({ ...DEFAULT_MODALS, [modal]: value }))
  }

  const { refs: actionMenuRefs, floatingStyles: actionMenuStyles } = useFloating({
    placement: 'bottom-start',
    open: modals.actionMenu,
    onOpenChange: open => onChangeModal('actionMenu', open),
    middleware: [inline(), flip(), shift(), offset(10)],
    whileElementsMounted: autoUpdate,
  })

  const { refs: highlightPickerRefs, floatingStyles: highlightPickerStyles } = useFloating({
    placement: 'top-end',
    open: modals.highlight,
    onOpenChange: open => onChangeModal('highlight', open),
    middleware: [inline(), flip(), shift(), offset(10)],
    whileElementsMounted: autoUpdate,
  })

  const { refs: linkToolRefs, floatingStyles: linkToolStyles } = useFloating({
    placement: 'top-start',
    open: modals.link,
    onOpenChange: open => onChangeModal('link', open),
    middleware: [inline(), flip(), shift(), offset(10)],
    whileElementsMounted: autoUpdate,
  })

  const getItemStyle = type => ({
    backgroundColor: editor.formats[type]?.isActive() ? '#f4f4f5' : undefined,
    color: editor.formats[type]?.isActive() ? '#fff' : undefined,
  })

  const highlight = editor.formats.highlight
  const highlightColors = highlight?.getValue()
  const getHighlightTriggerStyle = (): React.CSSProperties => {
    const buttonStyles = getModalTriggerStyle('highlight')

    return {
      color: highlightColors?.color,
      backgroundColor: buttonStyles.backgroundColor || highlightColors?.backgroundColor,
      backgroundImage: highlightColors?.backgroundImage,
      WebkitTextFillColor: highlightColors?.webkitTextFillColor,
    }
  }

  const blockLabel = activeBlock?.options?.display?.title || activeBlock?.type || ''

  const ActionMenu = tools.ActionMenu
  const LinkTool = tools.LinkTool

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (HOTKEYS.isEscape(e)) {
        setModals(DEFAULT_MODALS)
        toggleHoldToolbar?.(false)
        return
      }

      // [TODO]: Implement this accessibility feature
      // if (HOTKEYS.isEnter(e)) {
      //   if (modals.link) {
      //     onUpdateLink(linkValues);
      //   }
      // }
    }

    if (modals.link) {
      const slate = findSlateBySelectionPath(editor)
      if (!slate || !slate.selection) return

      lastSelection.current = slate.selection

      const title = Editor.string(slate, slate?.selection)
      const linkNodeEntry = getLinkEntry(slate)

      if (linkNodeEntry) {
        const [linkNode] = linkNodeEntry as NodeEntry<SlateElement>
        setLinkValues({ ...linkNode.props, title })
      } else {
        setLinkValues({ ...linkValues, title })
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [editor.path, editor.children, modals.link])

  const onUpdateLink = (link: LinkValues) => {
    if (typeof editor.path.current !== 'number') return

    const slate = Blocks.getBlockSlate(editor, { at: editor.path.current })
    if (!slate) return

    Editor.withoutNormalizing(slate, () => {
      if (!slate.selection) return

      const defaultLinkProps: Record<string, unknown> | undefined =
        editor.plugins?.LinkPlugin?.elements?.link?.props
      editor.commands.insertLink?.({
        slate,
        blockId: blockData?.id,
        props: {
          ...link,
          target: defaultLinkProps?.target || link.target || '_self',
          rel: defaultLinkProps?.rel || link.rel || 'noopener noreferrer',
          nodeType: 'inline',
        },
      })

      // editor.emit('change', { value: editor.children, operations: [] });

      onChangeModal('link', false)
      setLinkValues(DEFAULT_LINK_VALUE)
      toggleHoldToolbar?.(false)
    })
  }

  const onDeleteLink = () => {
    if (typeof editor.path.current !== 'number') return
    const slate = Blocks.getBlockSlate(editor, { at: editor.path.current })
    if (!slate) return

    editor.commands.deleteLink?.({ slate })

    onChangeModal('link', false)
    setLinkValues(DEFAULT_LINK_VALUE)
    toggleHoldToolbar?.(false)
  }

  const onClickLinkOverlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (linkToolRefs.floating.current?.contains(e.target as Node)) return

    toggleHoldToolbar?.(false)
    setModals(DEFAULT_MODALS)
  }

  const isActiveTriggerModal = (modal: keyof ModalsState) => modals[modal]
  const getModalTriggerStyle = (modal: keyof ModalsState) => ({
    backgroundColor: isActiveTriggerModal(modal) ? '#f4f4f5' : undefined,
  })

  const onToggleMark = (format: string) => {
    setModals(DEFAULT_MODALS)
    editor.formats[format].toggle()
  }

  const blockData = findPluginBlockByPath(editor, { at: editor.path.current })

  const onToggleAlign = () => {
    const aligns = ['left', 'center', 'right']
    if (!blockData) return

    const currentAlign = blockData?.meta?.align || 'left'
    const nextAlign = aligns[
      (aligns.indexOf(currentAlign) + 1) % aligns.length
    ] as YooptaBlockData['meta']['align']
    Blocks.updateBlock(editor, blockData.id, { meta: { ...blockData.meta, align: nextAlign } })
  }

  // const AlignIcon = ALIGN_ICONS[blockData?.meta?.align || 'left'];

  const onCloseActionMenu = () => onChangeModal('actionMenu', false)

  const actionMenuRenderProps = buildActionMenuRenderProps({
    editor,
    onClose: onCloseActionMenu,
    view: 'small',
  })

  return (
    <Toolbar.Root className="bg-white flex z-50 p-[2px] border border-[#D4D6D9] shadow-toolbarShadow rounded-[6px]">
      <Toolbar.ToggleGroup
        className="flex items-center"
        type="single"
        aria-label="Block formatting"
      >
        <Toolbar.ToggleItem
          className="cursor-pointer bg-transparent border-none h-full px-[6px] py-0 hover:bg-[#f4f4f5] rounded-md flex items-center gap-1"
          value={blockLabel}
          aria-label={blockLabel}
          ref={actionMenuRefs.setReference}
          onClick={() => onChangeModal('actionMenu', !modals.actionMenu)}
          style={getModalTriggerStyle('actionMenu')}
        >
          <span className="text-xs text-[#666C79] font-medium">{blockLabel}</span>
          {modals.actionMenu ? (
            <ChevronUpIcon width={10} color="#8C919A" />
          ) : (
            <ChevronDownIcon width={10} color="#8C919A" />
          )}
          {modals.actionMenu && !!ActionMenu && (
            <Portal id="yoo-toolbar-action-menu-list-portal">
              <button
                style={actionMenuStyles}
                ref={actionMenuRefs.setFloating}
                onClick={e => e.stopPropagation()}
              >
                <ActionMenu {...actionMenuRenderProps} />
              </button>
            </Portal>
          )}
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>

      <Toolbar.Separator className="bg-[#dbd8e0] w-[0.5px] h-[22px] my-auto mx-1" />

      {/* this is for undo/redo */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            editor.redo({ scroll: false })
          }}
          className="p-[6px] text-xs hover:bg-gray-200 hover:rounded-md disabled:opacity-50"
          disabled={editor.historyStack.redos.length === 0}
        >
          <RedoSvg />
        </button>
        <button
          type="button"
          onClick={() => {
            editor.undo({ scroll: false })
          }}
          className="p-[6px] text-xs hover:bg-gray-200 hover:rounded-md disabled:opacity-50"
          disabled={editor.historyStack.undos.length === 0}
        >
          <UndoSvg />
        </button>
      </div>

      <Toolbar.Separator className="bg-[#dbd8e0] w-[0.5px] h-[22px] my-auto mx-1" />

      <Toolbar.ToggleGroup
        className="flex items-center"
        type="multiple"
        aria-label="Text formatting"
      >
        {editor.formats.bold && (
          <Toolbar.ToggleItem
            className="bg-transparent border-none ml-[2px] h-[28px] hover:bg-[#f4f4f5] rounded-md cursor-pointer inline-flex px-[6px] py-0 items-center justify-center
"
            value="bold"
            aria-label="Bold"
            style={getItemStyle('bold')}
            onClick={() => onToggleMark('bold')}
          >
            <BoldSvg />
          </Toolbar.ToggleItem>
        )}
        {editor.formats.italic && (
          <Toolbar.ToggleItem
            className=" bg-transparent border-none ml-[2px] h-[28px] hover:bg-[#f4f4f5] rounded-md cursor-pointer inline-flex px-[6px] py-0 items-center justify-center
"
            value="italic"
            aria-label="Italic"
            style={getItemStyle('italic')}
            onClick={() => onToggleMark('italic')}
          >
            <ItalicSvg />
          </Toolbar.ToggleItem>
        )}
        {editor.formats.underline && (
          <Toolbar.ToggleItem
            className=" bg-transparent border-none ml-[2px] h-[28px] hover:bg-[#f4f4f5] rounded-md cursor-pointer inline-flex px-[6px] py-0 items-center justify-center
"
            value="underline"
            aria-label="Underline"
            style={getItemStyle('underline')}
            onClick={() => onToggleMark('underline')}
          >
            <UnderlineSvg />
          </Toolbar.ToggleItem>
        )}

        {editor.formats.strike && (
          <Toolbar.ToggleItem
            className="bg-transparent border-none ml-[2px] h-[28px] hover:bg-[#f4f4f5] rounded-md cursor-pointer inline-flex px-[6px] py-0 items-center justify-center
"
            value="strike"
            aria-label="Strike"
            style={getItemStyle('strike')}
            onClick={() => onToggleMark('strike')}
          >
            <StrikeSvg />
          </Toolbar.ToggleItem>
        )}
        {editor.formats.code && (
          <Toolbar.ToggleItem
            className="bg-transparent border-none ml-[2px] h-[28px] hover:bg-[#f4f4f5] rounded-md cursor-pointer inline-flex px-[6px] py-0 items-center justify-center
"
            value="code"
            aria-label="Code"
            style={getItemStyle('code')}
            onClick={() => onToggleMark('code')}
          >
            <CodeSvg />
          </Toolbar.ToggleItem>
        )}
      </Toolbar.ToggleGroup>

      <Toolbar.Separator className="bg-[#dbd8e0] w-[0.5px] h-[22px] my-auto mx-1" />

      <Toolbar.ToggleGroup
        className="flex items-center"
        type="multiple"
        aria-label="Text formatting"
      >
        <Toolbar.ToggleItem
          className="bg-transparent border-none ml-[2px] h-[28px] hover:bg-[#f4f4f5] rounded-md cursor-pointer inline-flex px-[6px] py-0 items-center justify-center"
          value="align"
          aria-label="Alignment"
          style={getItemStyle('align')}
          onClick={onToggleAlign}
        >
          <TextAlignSvg />
        </Toolbar.ToggleItem>

        {/* This is for color picker */}
        {editor.formats.highlight && (
          <>
            {modals.highlight && (
              <HighlightColor
                editor={editor}
                floatingStyles={highlightPickerStyles}
                refs={highlightPickerRefs}
                onClose={() => onChangeModal('highlight', false)}
                highlightColors={highlightColors}
              />
            )}

            <Toolbar.ToggleItem
              className="bg-transparent border-none ml-[2px] h-[28px] hover:bg-[#f4f4f5] rounded-md cursor-pointer inline-flex px-[6px] py-0 items-center justify-center gap-1"
              value="highlight"
              aria-label="Highlight"
              style={getHighlightTriggerStyle()}
              ref={highlightPickerRefs.setReference}
              onClick={() => onChangeModal('highlight', !modals.highlight)}
            >
              <ColorSvg />
              {modals.highlight ? (
                <ChevronUpIcon width={10} color="#8C919A" />
              ) : (
                <ChevronDownIcon width={10} color="#8C919A" />
              )}
            </Toolbar.ToggleItem>
          </>
        )}
        {/* This is for link tool */}
        <Toolbar.ToggleItem
          className="cursor-pointer bg-transparent border-none h-full px-[6px] py-0 hover:bg-[#f4f4f5] rounded-md
"
          value="LinkTool"
          aria-label="LinkTool"
          ref={linkToolRefs.setReference}
          onClick={() => {
            onChangeModal('link', !modals.link)
            toggleHoldToolbar?.(true)
          }}
          style={getModalTriggerStyle('link')}
        >
          <LinkSvg />
          {modals.link && !!LinkTool && (
            <Portal id="yoo-link-tool-portal">
              <Overlay lockScroll className="z-[100]" onClick={onClickLinkOverlay}>
                <div style={linkToolStyles} ref={linkToolRefs.setFloating}>
                  <LinkTool link={linkValues} onSave={onUpdateLink} onDelete={onDeleteLink} />
                </div>
              </Overlay>
            </Portal>
          )}
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
    </Toolbar.Root>
  )
}

export { DefaultToolbarRender }
