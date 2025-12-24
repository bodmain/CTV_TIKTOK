import { NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'

import { prisma } from '@/libs/prisma'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    // 1. Kiểm tra đầu vào
    if (!token || !password) {
      return NextResponse.json({ error: 'Thiếu thông tin xác thực.' }, { status: 400 })
    }

    // 2. Tìm và kiểm tra Token trong Database
    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!existingToken) {
      return NextResponse.json({ error: 'Mã xác thực không hợp lệ.' }, { status: 400 })
    }

    // 3. Kiểm tra thời hạn (1 giờ như đã thiết lập ở bước trước)
    const hasExpired = new Date(existingToken.expires) < new Date()

    if (hasExpired) {
      // Nếu hết hạn, xóa luôn token này cho sạch DB
      await prisma.passwordResetToken.delete({ where: { id: existingToken.id } })

      return NextResponse.json({ error: 'Mã xác thực đã hết hạn.' }, { status: 400 })
    }

    // 4. Tìm người dùng sở hữu token này
    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Người dùng không tồn tại.' }, { status: 404 })
    }

    // 5. Mã hóa mật khẩu mới và cập nhật
    const hashedPassword = await bcrypt.hash(password, 10)

    // Sử dụng transaction để đảm bảo: Đổi mật khẩu xong thì phải xóa Token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.delete({
        where: { id: existingToken.id }
      })
    ])

    return NextResponse.json({ message: 'Mật khẩu đã được cập nhật thành công!' }, { status: 200 })
  } catch (error) {
    console.error('RESET_PASSWORD_ERROR:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
