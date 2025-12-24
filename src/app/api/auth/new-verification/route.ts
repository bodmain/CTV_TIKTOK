import { NextResponse } from 'next/server'

import { prisma } from '@/libs/prisma'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Mã xác thực không tồn tại.' }, { status: 400 })
    }

    // 1. Tìm token trong bảng VerificationToken (hoặc bảng tương ứng của bạn)
    const existingToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!existingToken) {
      return NextResponse.json({ error: 'Mã xác thực không hợp lệ.' }, { status: 400 })
    }

    // 2. Kiểm tra xem token đã hết hạn chưa
    const hasExpired = new Date(existingToken.expires) < new Date()

    if (hasExpired) {
      return NextResponse.json({ error: 'Mã xác thực đã hết hạn.' }, { status: 400 })
    }

    // 3. Tìm người dùng dựa trên email đi kèm với token
    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Email không tồn tại.' }, { status: 404 })
    }

    // 4. Cập nhật trạng thái xác minh và (tùy chọn) cập nhật lại email
    // Sử dụng transaction để đảm bảo cả 2 thao tác (update user và xóa token) đều thành công
    await prisma.$transaction([
      prisma.user.update({
        where: { id: existingUser.id },
        data: {
          emailVerified: new Date(),
          email: existingToken.email // Hữu ích nếu người dùng đổi email mới
        }
      }),

      // 5. Xóa token sau khi sử dụng để tránh dùng lại
      prisma.verificationToken.delete({
        where: { id: existingToken.id }
      })
    ])

    return NextResponse.json({ message: 'Xác thực email thành công!' }, { status: 200 })
  } catch (error) {
    console.error('New verification error:', error)

    return NextResponse.json({ error: 'Lỗi hệ thống nội bộ.' }, { status: 500 })
  }
}
