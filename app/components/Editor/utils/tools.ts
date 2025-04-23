import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool'
import ActionMenuList from '@yoopta/action-menu-list'
import Toolbar from '@yoopta/toolbar'
import { ActionNotionMenuExample } from '../actionMenu/ActionNotionMenuExample'
import { DefaultToolbarRender } from '../toolbar/DefaultToolbarRender'

export const TOOLS = {
  ActionMenu: {
    render: ActionNotionMenuExample,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
  LinkTool: {
    render: DefaultLinkToolRender,
    tool: LinkTool,
  },
}
