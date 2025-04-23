import Paragraph from '@yoopta/paragraph'
import Blockquote from '@yoopta/blockquote'
import Embed from '@yoopta/embed'
import Image, { type ImageUploadResponse } from '@yoopta/image'
import Link from '@yoopta/link'
import Callout from '@yoopta/callout'
import Video from '@yoopta/video'
import File from '@yoopta/file'
import Accordion from '@yoopta/accordion'
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists'
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings'
import Code from '@yoopta/code'
import Table from '@yoopta/table'
import Divider from '@yoopta/divider'
import { PagePlugin } from '../withCustomPlugin/customPlugins/Page'

// Define the plugins used in the editor.
export const plugins = [
  // Standard text and layout plugins
  Paragraph,
  // PagePlugin,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  BulletedList,
  NumberedList,
  TodoList,
  Accordion,

  // Divider plugin with customized color for the divider line
  Divider.extend({
    elementProps: {
      divider: props => ({
        ...props,
        color: '#007aff', // Set the divider color to blue
      }),
    },
  }),

  // Media and content embedding plugins
  Callout,
  Blockquote,
  Table,
  Embed,
  Code,
  Link,

  // Image plugin with custom onUpload functionality
  Image.extend({
    options: {
      // Upload handler for image files
      async onUpload(file): Promise<ImageUploadResponse> {
        if (!file) {
          // console.error('No file received')
          return null // Return null if no file is provided
        }

        // Prepare form data for the API request
        const formData = new FormData()
        formData.append('file', file) // Append the file to be uploaded
        formData.append('type', 'image') // Append the file type for server processing

        // Send the file to the R2 upload API
        const response = await fetch('/api/r2upload', {
          method: 'POST',
          body: formData,
        })

        // Handle failed upload responses
        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`)
        }

        // Parse and return the response data
        const data = await response.json()
        return {
          src: data.secure_url, // URL to the uploaded image
          alt: 'Uploaded Image', // Alt text for the image
          sizes: {
            width: data.width, // Width of the uploaded image
            height: data.height, // Height of the uploaded image
          },
        }
      },
    },
  }),

  // Video plugin with custom upload and poster upload functionality
  Video.extend({
    options: {
      // Upload handler for video files
      async onUpload(file) {
        if (!file) {
          // console.error('No file received')
          return null // Return null if no file is provided
        }

        // Prepare form data for the API request
        const formData = new FormData()
        formData.append('file', file) // Append the video file
        formData.append('type', 'video') // Specify the type as 'video'

        // Send the video file to the R2 upload API
        const response = await fetch('/api/r2upload', {
          method: 'POST',
          body: formData,
        })

        // Handle failed upload responses
        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`)
        }

        // Parse and return the response data
        const data = await response.json()
        return {
          src: data.secure_url, // URL to the uploaded video
          alt: 'Uploaded Video', // Alt text for the video
          sizes: {
            width: 600, // Default width for video
            height: 400, // Default height for video
          },
        }
      },

      // Upload handler for video poster images
      async onUploadPoster(file) {
        if (!file) {
          // console.error('No poster file received')
          return null // Return null if no file is provided
        }

        // Prepare form data for the poster upload
        const formData = new FormData()
        formData.append('file', file) // Append the poster file
        formData.append('type', 'image') // Specify the type as 'image'

        // Send the poster file to the R2 upload API
        const response = await fetch('/api/r2upload', {
          method: 'POST',
          body: formData,
        })

        // Handle failed upload responses
        if (!response.ok) {
          throw new Error(`Poster upload failed with status ${response.status}`)
        }

        // Parse and return the poster URL
        const data = await response.json()
        return data.secure_url // Return the secure URL of the uploaded poster
      },
    },
  }),

  // File plugin with custom upload functionality
  File.extend({
    options: {
      // Upload handler for general files
      async onUpload(file) {
        if (!file) {
          // console.error('No file received')
          return null // Return null if no file is provided
        }

        // Prepare form data for the API request
        const formData = new FormData()
        formData.append('file', file) // Append the file to be uploaded
        formData.append('type', 'file') // Specify the file type for server processing

        // Send the file to the R2 upload API
        const response = await fetch('/api/r2upload', {
          method: 'POST',
          body: formData,
        })

        // Handle failed upload responses
        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`)
        }

        // Parse and return the response data
        const data = await response.json()
        return {
          src: data.secure_url, // URL to the uploaded file
          format: data.format, // Format of the file (e.g., pdf, docx)
          name: data.name, // Name of the uploaded file
          size: data.bytes, // Size of the uploaded file in bytes
        }
      },
    },
  }),
]
