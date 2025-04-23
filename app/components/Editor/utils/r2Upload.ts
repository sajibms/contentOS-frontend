import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Buffer } from 'buffer'

// Configuration for R2 (Cloudflare's object storage) using environment variables
export const R2 = {
  BUCKET_NAME: import.meta.env.R2_BUCKET_NAME!, // The R2 bucket name, loaded from environment variables
  ACCESS_KEY_ID: import.meta.env.R2_ACCESS_KEY_ID!, // The R2 access key ID, loaded from environment variables
  SECRET_ACCESS_KEY: import.meta.env.R2_SECRET_ACCESS_KEY!, // The R2 secret access key, loaded from environment variables
  ACCOUNT_ID: import.meta.env.R2_ACCOUNT_ID!, // The account ID for R2, found in the R2 dashboard
  ENDPOINT: `https://${import.meta.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, // R2 endpoint URL
  PUBLIC_URL: import.meta.env.R2_PUBLIC_URL, // The public URL to access the uploaded files
}

// Type definitions for media objects
export type MediaObject = {
  secure_url: string // The URL to access the uploaded file securely
  url: string // The URL to access the uploaded file
  height: number // Image height (R2 doesn't provide metadata, so set to 0)
  width: number // Image width (R2 doesn't provide metadata, so set to 0)
  asset_id: string // The unique asset ID for the uploaded file
  format: string // The file format (e.g., 'jpg', 'mp4')
  public_id: string // The public ID (could be the file name or path)
  version_id: string // Version ID (R2 doesn't support versioning, so set to "N/A")
  name: string // The file name
  bytes: number // The file size in bytes
}

export type ImageObject = MediaObject // Image object is just a specialized version of MediaObject

// Initialize R2 client for uploading files
const r2Client = new S3Client({
  region: 'auto', // R2 automatically handles the region
  endpoint: R2.ENDPOINT, // R2 endpoint URL
  credentials: {
    accessKeyId: R2.ACCESS_KEY_ID, // Access key ID for R2
    secretAccessKey: R2.SECRET_ACCESS_KEY, // Secret access key for R2
  },
})

// Function to upload images to R2
export const uploadToR2 = async (file: File, type = 'image'): Promise<MediaObject> => {
  const buffer = await file.arrayBuffer() // Convert the file to a buffer
  const filePath = `${Date.now()}-${file.name}` // Generate a unique file path using the current timestamp

  const uploadParams = {
    Bucket: 'template', // The R2 bucket to upload the file to
    Key: `template/${filePath}`, // The file path in the R2 bucket
    Body: Buffer.from(buffer), // The file data as a buffer
    ContentType: file.type, // The MIME type of the file
  }

  try {
    // Upload the file to R2
    await r2Client.send(new PutObjectCommand(uploadParams))

    // Return a MediaObject with the file's details
    return {
      secure_url: `${R2.PUBLIC_URL}/${filePath}`,
      url: `${R2.PUBLIC_URL}/${filePath}`,
      height: 0, // R2 doesn't provide image metadata, so set to 0
      width: 0, // R2 doesn't provide image metadata, so set to 0
      asset_id: filePath, // Use the file path as the asset ID
      format: file.type.split('/')[1], // Extract the format from the MIME type
      public_id: filePath, // Use the file path as the public ID
      version_id: 'N/A', // R2 doesn't support versioning
      name: file.name, // The original file name
      bytes: file.size, // The file size in bytes
    }
  } catch (error) {
    return Promise.reject(error) // Reject the promise if an error occurs
  }
}

// Type definition for video objects (similar to images but for videos)
export type VideoObject = {
  secure_url: string // The secure URL of the uploaded video
  url: string // The URL of the uploaded video
  asset_id: string // The unique asset ID for the uploaded video
  format: string // The file format (e.g., 'mp4')
  public_id: string // The public ID (could be the file name or path)
  version_id: string // Version ID (R2 doesn't support versioning, so set to "N/A")
  name: string // The file name
  bytes: number // The file size in bytes
}

// Function to upload videos to R2
export const uploadVideoToR2 = async (file: File): Promise<VideoObject> => {
  if (!file.type.startsWith('video/')) {
    // Ensure the file is a video
    throw new Error('Invalid file type. Please upload a video.')
  }

  const buffer = await file.arrayBuffer() // Convert the video file to a buffer
  const filePath = `${Date.now()}-${file.name}` // Generate a unique file path using the current timestamp

  const uploadParams = {
    Bucket: R2.BUCKET_NAME, // The R2 bucket to upload the file to
    Key: `template/${filePath}`, // The file path in the R2 bucket
    Body: Buffer.from(buffer), // The video data as a buffer
    ContentType: file.type, // The MIME type of the video
  }

  try {
    // Upload the video to R2
    await r2Client.send(new PutObjectCommand(uploadParams))

    // Return a VideoObject with the video details
    return {
      secure_url: `${R2.PUBLIC_URL}/${filePath}`,
      url: `${R2.PUBLIC_URL}/${filePath}`,
      asset_id: filePath, // Use the file path as the asset ID
      format: file.type.split('/')[1], // Extract the format from the MIME type
      public_id: filePath, // Use the file path as the public ID
      version_id: 'N/A', // R2 doesn't support versioning
      name: file.name, // The original file name
      bytes: file.size, // The file size in bytes
    }
  } catch (error) {
    return Promise.reject(error) // Reject the promise if an error occurs
  }
}

// Type definition for generic file objects
export type FileObject = {
  secure_url: string // The secure URL of the uploaded file
  url: string // The URL of the uploaded file
  asset_id: string // The unique asset ID for the uploaded file
  format: string // The file format (e.g., 'pdf', 'txt')
  public_id: string // The public ID (could be the file name or path)
  version_id: string // Version ID (R2 doesn't support versioning, so set to "N/A")
  name: string // The file name
  bytes: number // The file size in bytes
}

// Function to upload general files (non-image, non-video) to R2
export const uploadFileToR2 = async (file: File): Promise<FileObject> => {
  const buffer = await file.arrayBuffer() // Convert the file to a buffer
  const filePath = `${Date.now()}-${file.name}` // Generate a unique file path using the current timestamp

  const uploadParams = {
    Bucket: R2.BUCKET_NAME, // The R2 bucket to upload the file to
    Key: `template/${filePath}`, // The file path in the R2 bucket
    Body: Buffer.from(buffer), // The file data as a buffer
    ContentType: file.type || 'application/octet-stream', // The MIME type of the file (default to 'application/octet-stream')
  }

  try {
    // Upload the file to R2
    await r2Client.send(new PutObjectCommand(uploadParams))

    // Return a FileObject with the file details
    return {
      secure_url: `${R2.PUBLIC_URL}/${filePath}`,
      url: `${R2.PUBLIC_URL}/${filePath}`,
      asset_id: filePath, // Use the file path as the asset ID
      format: file.name.split('.').pop() || 'unknown', // Extract the file extension as the format
      public_id: filePath, // Use the file path as the public ID
      version_id: 'N/A', // R2 doesn't support versioning
      name: file.name, // The original file name
      bytes: file.size, // The file size in bytes
    }
  } catch (error) {
    return Promise.reject(error) // Reject the promise if an error occurs
  }
}
