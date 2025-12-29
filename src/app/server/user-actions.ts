'use server'

// Sửa dòng này: thêm dấu ngoặc nhọn { }
import { revalidatePath } from 'next/cache'

import { prisma } from '@/libs/prisma'

import { auth } from '@/libs/auth'

export async function updateAvatar(imageUrl: string) {
  const session = await auth()

  if (!session?.user?.email) return { error: 'Unauthorized' }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl }
    })

    revalidatePath('/profile')
    
return { success: true }
  } catch (error) {
    console.error('Database Error:', error) // Log lỗi ra để dễ debug
    
return { error: 'Lỗi cập nhật Database' }
  }
}
