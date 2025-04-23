import { useEffect } from 'react'
import { Elements, type PluginElementRenderProps, useYooptaEditor } from '@yoopta/editor'
import FileText from '~/components/Editor/actionMenu/icons/FileText'
import { useActionData, useParams } from 'react-router'

const PageRenderElement = ({ element, attributes, blockId }: PluginElementRenderProps) => {
  const actionData = useActionData()
  const editor = useYooptaEditor()
  const { id } = useParams()

  // Listen for API responses via fetcher.
  useEffect(() => {
    const handleFetcherData = async () => {
      if (actionData?.id && actionData?.title && !element?.props?.pageId) {
        const elementPath = Elements.getElementPath(editor, blockId, element)

        Elements.updateElement(
          editor,
          blockId,
          {
            type: 'page',
            props: {
              ...element.props,
              title: actionData?.title,
              pageId: actionData?.id,
              parentId: id,
            },
          },
          { path: elementPath },
        )
      }
    }

    handleFetcherData()
  }, [actionData])

  return (
    <div
      {...attributes}
      className="w-full flex relative items-center h-[20px] my-1"
      contentEditable={false}
    >
      {element?.props?.pageId ? (
        <Link
          to={`/dashboard/content/${element?.props?.pageId}`}
          className="text-black underline py-2 border-2 rounded-sm flex items-center gap-x-1"
        >
          <span>
            <FileText />
          </span>{' '}
          {element.props.title}
        </Link>
      ) : (
        <Form method="post">
          <input type="hidden" name="parentId" value={id} />
          <input type="hidden" name="parentPageBlockId" value={blockId} />
          <input type="hidden" name="parentPageElementId" value={element.id} />
          <button
            type="submit"
            className="text-black underline py-2 border-2 flex gap-x-1 rounded-sm items-center"
          >
            <FileText />
            Create Page
          </button>
        </Form>
      )}
    </div>
  )
}

export { PageRenderElement }
