import { NextResponse } from 'next/server'

import { auth } from '@/libs/auth' // Import hàm auth để lấy session hiện tại
import { prisma } from '@/libs/prisma'

export async function GET() {
  try {
    // 1. Kiểm tra session người dùng (Phải đăng nhập mới được đổi)
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để thực hiện thao tác này.' }, { status: 401 })
    }

    // 2. Lấy Log từ DB
    const recenDevice = await prisma.loginLog.findMany({
      take: 10,
      orderBy: { loginTime: 'desc' }
    })

    return NextResponse.json(recenDevice)
  } catch (error) {
    console.error('Recent Device Error:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
