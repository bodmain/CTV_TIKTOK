'use server'

import { prisma } from '@/libs/prisma'
import { auth } from '@/libs/auth'
import { revalidatePath } from 'next/cache'

// Lấy thông tin KYC hiện tại
export async function getKYCStatus() {
  const session = await auth()
  if (!session?.user?.email) return null

  return await prisma.kYC.findFirst({
    where: { user: { email: session.user.email } }
  })
}

// Gửi hồ sơ (Nhận URL ảnh đã upload)
export async function submitKYC(data: { fullName: string; idNumber: string; frontUrl: string; backUrl: string }) {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Unauthorized' }

  try {
    const userEmail = session.user.email

    // Kiểm tra xem user đã gửi chưa
    const existing = await prisma.kYC.findFirst({
      where: { user: { email: userEmail } }
    })

    // Nếu đang chờ duyệt hoặc đã duyệt thì chặn
    if (existing?.status === 'PENDING') return { error: 'Hồ sơ đang chờ duyệt.' }
    if (existing?.status === 'APPROVED') return { error: 'Đã xác minh thành công.' }

    // Logic: Nếu bị từ chối thì Update, chưa có thì Create
    if (existing) {
      await prisma.kYC.update({
        where: { id: existing.id },
        data: {
          fullName: data.fullName,
          idNumber: data.idNumber,
          imageFront: data.frontUrl,
          imageBack: data.backUrl,
          status: 'PENDING', // Reset trạng thái để Admin duyệt lại
          note: null // Xóa ghi chú lỗi cũ
        }
      })
    } else {
      await prisma.kYC.create({
        data: {
          fullName: data.fullName,
          idNumber: data.idNumber,
          imageFront: data.frontUrl,
          imageBack: data.backUrl,
          status: 'PENDING',
          user: { connect: { email: userEmail } }
        }
      })
    }

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('KYC Error:', error)
    return { error: 'Lỗi hệ thống khi lưu hồ sơ.' }
  }
}
