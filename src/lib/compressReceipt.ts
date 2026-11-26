import imageCompression from 'browser-image-compression'

// Shrinks any receipt photo before upload (target about 300 KB, max 1600 px)
export async function compressReceipt(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/jpeg',
  })
}