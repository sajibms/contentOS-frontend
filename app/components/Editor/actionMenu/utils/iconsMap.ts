import TextSvg from '../icons/TextSvg'
import BlockquoteSvg from '../icons/BlockquoteSvg'
import CallOutSvg from '../icons/CallOutSvg'
import ImageSvg from '../icons/ImageSvg'
import VideoSvg from '../icons/VideoSvg'
import FileSvg from '../icons/FileSvg'
import CodeSvg from '../icons/CodeSvg'
import H1Svg from '../icons/H1Svg'
import H2Svg from '../icons/H2Svg'
import H3Svg from '../icons/H3Svg'
import BulleteListSvg from '../icons/BulleteListSvg'
import NumberListSvg from '../icons/NumberListSvg'
import TodoListSvg from '../icons/TodoListSvg'
import EmbedLinkSvg from '../icons/EmbedLinkSvg'
import TableSvg from '../icons/TableSvg'
import DividerSvg from '../icons/DividerSvg'
// import Accordion from '@yoopta/accordion';
import ToggleListSvg from '../icons/ToggleListSvg'
import FileText from '../icons/FileText'

export const ICONS_SRC = {
  Paragraph: TextSvg,
  Page: FileText,
  Blockquote: BlockquoteSvg,
  Callout: CallOutSvg,
  Image: ImageSvg,
  Video: VideoSvg,
  File: FileSvg,
  Code: CodeSvg,
  HeadingOne: H1Svg,
  HeadingTwo: H2Svg,
  HeadingThree: H3Svg,
  BulletedList: BulleteListSvg,
  NumberedList: NumberListSvg,
  TodoList: TodoListSvg,
  Embed: EmbedLinkSvg,
  Table: TableSvg,
  Divider: DividerSvg,
  Accordion: ToggleListSvg,
  Button: TodoListSvg,
}

export const SYMBOLS_MAP: Record<string, string> = {
  Paragraph: '',
  Blockquote: '>',
  Callout: '<',
  Image: '',
  Video: '',
  File: '',
  Code: '```',
  HeadingOne: '#',
  HeadingTwo: '##',
  HeadingThree: '###',
  BulletedList: '-',
  NumberedList: '1.',
  TodoList: '[]',
  Embed: '',
  Table: '',
  Divider: '---',
  Accordion: '',
  Button: '',
}
