import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
  type YooptaOnChangeOptions,
} from '@yoopta/editor'

import Paragraph from '@yoopta/paragraph'
import Blockquote from '@yoopta/blockquote'
import Embed from '@yoopta/embed'
import Image from '@yoopta/image'
import Link from '@yoopta/link'
import Callout from '@yoopta/callout'
import Video from '@yoopta/video'
import File from '@yoopta/file'
import Accordion from '@yoopta/accordion'
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists'
import { HeadingOne, HeadingThree, HeadingTwo } from '@yoopta/headings'
import Code from '@yoopta/code'
import Table from '@yoopta/table'
import Divider from '@yoopta/divider'

import { useMemo, useRef, useState } from 'react'
import { TOOLS } from '../utils/tools'
import { MARKS } from '../utils/marks'

export const CLOUDINARY = {
  PRESET: 'add you cloudinary preset',
  API: 'Add your cloudinary Api',
  CLOUD_NAME: 'Add your cloudinary cloud name',
}

export type MediaObject = {
  secure_url: string
  url: string
  height: number
  width: number
  asset_id: string
  format: string
  public_id: string
  version_id: string
  name: string
  bytes: number
}

export type ImageObject = MediaObject
export type VideoObject = MediaObject

export const uploadToCloudinary = async (file: File, type = 'image'): Promise<MediaObject> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY.PRESET)

  try {
    const call = await fetch(`${CLOUDINARY.API}/${type}/upload`, { method: 'POST', body: formData })
    const response = await call.json()

    return {
      secure_url: response.secure_url,
      width: response.width,
      height: response.height,
      url: response.url,
      asset_id: response.asset_id,
      format: response.format,
      public_id: response.public_id,
      version_id: response.version_id,
      name: response.original_filename,
      bytes: response.bytes,
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

const plugins = [
  Paragraph,
  Table,
  Divider.extend({
    elementProps: {
      divider: props => ({
        ...props,
        color: '#007aff',
      }),
    },
  }),
  Accordion,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Blockquote,
  Callout,
  NumberedList,
  BulletedList,
  TodoList,
  Code,
  Link,
  Embed,
  Image.extend({
    options: {
      async onUpload(file) {
        const data = await uploadToCloudinary(file, 'image')

        return {
          src: data.secure_url,
          alt: 'cloudinary',
          sizes: {
            width: data.width,
            height: data.height,
          },
        }
      },
    },
  }),
  Video.extend({
    options: {
      onUpload: async file => {
        const data = await uploadToCloudinary(file, 'video')
        return {
          src: data.secure_url,
          alt: 'cloudinary',
          sizes: {
            width: data.width,
            height: data.height,
          },
        }
      },
      onUploadPoster: async file => {
        const image = await uploadToCloudinary(file, 'image')
        return image.secure_url
      },
    },
  }),
  File.extend({
    options: {
      onUpload: async file => {
        const response = await uploadToCloudinary(file, 'auto')
        return {
          src: response.secure_url,
          format: response.format,
          name: response.name,
          size: response.bytes,
        }
      },
    },
  }),
]

function TextEditor() {
  const [value, setValue] = useState()
  const editor = useMemo(() => createYooptaEditor(), [])
  const selectionRef = useRef(null)

  const onChange = (newValue: YooptaContentValue, options: YooptaOnChangeOptions) => {
    setValue(newValue)
  }

  return (
    <div
      className="md:py-[100px] md:pl-[200px] border md:pr-[80px] px-[20px] pt-[80px] pb-[40px] flex justify-center"
      ref={selectionRef}
    >
      <YooptaEditor
        width={672}
        editor={editor}
        plugins={plugins}
        tools={TOOLS}
        marks={MARKS}
        selectionBoxRoot={selectionRef}
        value={value}
        onChange={onChange}
        autoFocus
      />
    </div>
  )
}

export default TextEditor
