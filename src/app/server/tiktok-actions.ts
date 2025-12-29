// src/app/server/tiktok-actions.ts
'use server'

import { prisma } from '@/libs/prisma'
import { auth } from '@/libs/auth'
import { revalidatePath } from 'next/cache'

export async function getTikTokAccounts() {
  const session = await auth()
  if (!session?.user?.email) return []
  return await prisma.tikTokAccount.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { createdAt: 'desc' }
  })
}

// --- SỬA LẠI HÀM NÀY CHO AN TOÀN ---
export async function addTikTokAccount(data: any) {
  // Dùng any tạm để tránh lỗi type khi nhận sai data
  const session = await auth()
  if (!session?.user?.email) return { error: 'Unauthorized' }

  // 1. Kiểm tra kỹ dữ liệu đầu vào để tránh crash
  if (!data) return { error: 'Dữ liệu không hợp lệ' }

  // Xử lý trường hợp Client lỡ gửi string thay vì object
  const usernameRaw = typeof data === 'string' ? data : data.username
  const passwordRaw = typeof data === 'object' ? data.password : ''

  if (!usernameRaw || typeof usernameRaw !== 'string') {
    return { error: 'Vui lòng nhập Username' }
  }

  // 2. Xử lý logic như cũ
  const cleanUsername = usernameRaw.trim().startsWith('@') ? usernameRaw.trim() : `@${usernameRaw.trim()}`

  try {
    const mockAvatar = `https://ui-avatars.com/api/?name=${cleanUsername}&background=000000&color=fff`

    await prisma.tikTokAccount.create({
      data: {
        username: cleanUsername,
        password: passwordRaw || '', // Lưu mật khẩu (nếu có)
        nickname: 'TikTok User',
        followers: '0',
        avatar: mockAvatar,
        user: { connect: { email: session.user.email } }
      }
    })
    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error(error) // Log lỗi ra để dễ debug
    return { error: 'Tài khoản này đã tồn tại hoặc lỗi hệ thống.' }
  }
}

export async function deleteTikTokAccount(id: string) {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Unauthorized' }
  await prisma.tikTokAccount.delete({ where: { id } })
  revalidatePath('/profile')
  return { success: true }
}

// Bỏ checkLiveStatus thủ công
export async function checkLiveStatus(id: string, username: string) {
  return { success: true }
}
