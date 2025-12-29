// File: src/app/api/upload-avatar/avatar/route.ts
import { NextResponse } from 'next/server'

import { v2 as cloudinary } from 'cloudinary'

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Không có file nào được tải lên' }, { status: 400 })
    }

    // Chuyển file thành Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload lên Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'ctv_tiktok_avatars', // Tên thư mục trên Cloudinary
            resource_type: 'image',
            transformation: [{ width: 500, height: 500, crop: 'fill' }]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        .end(buffer)
    })

    // Trả về URL
    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    console.error('Upload error:', error)
    
return NextResponse.json({ error: 'Lỗi server khi upload ảnh' }, { status: 500 })
  }
}
