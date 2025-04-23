import { YooptaPlugin } from '@yoopta/editor'
import { PageRenderElement } from './renders/Page'
import FileText from '~/components/Editor/actionMenu/icons/FileText'

const PagePlugin = new YooptaPlugin({
  type: 'Page',
  elements: {
    page: {
      render: PageRenderElement,
      asRoot: true,
      props: {
        title: 'New Page',
        pageId: null,
        parentId: null,
        nodeType: 'void',
      },
    },
  },
  options: {
    shortcuts: ['/page'],
    display: {
      title: 'Page',
      description: 'Insert a new page block',
      icon: <FileText />,
    },
  },
})

export { PagePlugin }
