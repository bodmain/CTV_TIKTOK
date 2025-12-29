// Hàm này upload file lên Cloudinary và trả về URL
export const uploadToCloudinary = async (file: File): Promise<string | null> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'duplc7ytd') // <-- Thay preset của bạn vào đây
  formData.append('folder', 'ctv_kyc_upload') // Nên gom vào folder riêng

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/duplc7ytd/image/upload`, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) throw new Error('Upload failed')

    const data = await res.json()
    return data.secure_url // Trả về link ảnh
  } catch (error) {
    console.error(error)
    return null
  }
}
