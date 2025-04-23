/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Generates a heading hierarchy from editor content blocks.
 * @param {Object} value - The editor content state object.
 * @returns {Array} The heading hierarchy with nested levels.
 */
export const generateHeadingHierarchy = (value: { [s: string]: any } | ArrayLike<unknown>) => {
  // Extract blocks from the editor content state.
  const blocks = value ? Object.values(value) : []

  // Sort blocks based on the `order` property in meta.
  blocks?.sort((a, b) => a.meta.order - b.meta.order)

  // Utility function to extract text from a block's value array.
  const extractText = (block: any) => {
    return block.value
      .map((item: { children: any[] }) =>
        item.children.map((child: { text: any }) => child.text).join(''),
      )
      .join(' ')
  }

  // Build the hierarchy for headings and include the block id and occurrence index.
  const hierarchy: { id: any; text: any; occurrenceIndex: number; type: any; children: never[] }[] =
    []
  let currentHeadingOne: {
    children: any
    id?: any
    text?: any
    occurrenceIndex?: number
    type?: any
  } | null = null
  let currentHeadingTwo: {
    children: any
    id?: any
    text?: any
    occurrenceIndex?: number
    type?: any
  } | null = null
  const headingOccurrences = {}

  blocks.forEach(block => {
    if (block.type.startsWith('Heading')) {
      const headingText = extractText(block)

      // Determine the occurrence index for this heading text.
      if (!headingOccurrences[headingText]) {
        headingOccurrences[headingText] = 0
      }
      const occurrenceIndex = headingOccurrences[headingText]++

      const node = {
        id: block.id, // block id (if available)
        text: headingText,
        occurrenceIndex, // unique index for duplicate texts
        type: block.type,
        children: [],
      }

      if (block.type === 'HeadingOne') {
        hierarchy.push(node)
        currentHeadingOne = node
        currentHeadingTwo = null
      } else if (block.type === 'HeadingTwo') {
        if (currentHeadingOne) {
          currentHeadingOne.children.push(node)
        } else {
          hierarchy.push(node)
        }
        currentHeadingTwo = node
      } else if (block.type === 'HeadingThree') {
        if (currentHeadingTwo) {
          currentHeadingTwo.children.push(node)
        } else if (currentHeadingOne) {
          currentHeadingOne.children.push(node)
        } else {
          hierarchy.push(node)
        }
      }
    }
  })

  return hierarchy
}
