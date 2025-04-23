/* eslint-disable @typescript-eslint/no-explicit-any */
// import { ReactElement, JSXElementConstructor, ReactNode, SetStateAction } from 'react'

export const scrollToHeadingByText = (
  headingText:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | Iterable<React.ReactNode>
    | null
    | undefined,
  occurrenceIndex: number,
  setActiveHeading: { (value: React.SetStateAction<string | null>): void; (arg0: string): void },
) => {
  // Query all heading elements using known CSS selectors.
  const selectors = '.yoopta-heading-one, .yoopta-heading-two, .yoopta-heading-three'
  const headingElements = Array.from(document.querySelectorAll(selectors))

  // Filter to only elements that match the text.
  const matchingElements = headingElements.filter(el => {
    return el.innerText.trim() === headingText.trim()
  })

  if (matchingElements.length > occurrenceIndex) {
    setActiveHeading(`${headingText}-${occurrenceIndex}`)
    matchingElements[occurrenceIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  } else {
    console.warn(
      'No matching heading found for text:',
      headingText,
      'at occurrence',
      occurrenceIndex,
    )
  }
}
