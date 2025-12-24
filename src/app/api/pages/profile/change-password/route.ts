import { NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'

import { auth } from '@/libs/auth' // Import hàm auth để lấy session hiện tại
import { prisma } from '@/libs/prisma'

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra session người dùng (Phải đăng nhập mới được đổi)
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để thực hiện thao tác này.' }, { status: 401 })
    }

    const { password } = await req.json()

    // 2. Lấy user từ DB để lấy mật khẩu hiện tại (đã hash)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Không tìm thấy thông tin người dùng.' }, { status: 404 })
    }

    // 3. Hash mật khẩu mới và cập nhật vào DB
    const hashedNewPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json({ message: 'Đổi mật khẩu thành công!' }, { status: 200 })
  } catch (error) {
    console.error('CHANGE_PASSWORD_ERROR:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
