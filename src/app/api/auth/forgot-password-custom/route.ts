import crypto from 'crypto'

import { NextResponse } from 'next/server'

import { prisma } from '@/libs/prisma'
import { sendPasswordResetEmail } from '@/mail-templete/password-reset' // Đường dẫn tới file mail bạn vừa tạo

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // 1. Kiểm tra đầu vào
    if (!email) {
      return NextResponse.json({ error: 'Vui lòng nhập địa chỉ email.' }, { status: 400 })
    }

    // 2. Tìm kiếm người dùng trong Database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    /**
     * VỀ BẢO MẬT: Nếu không tìm thấy user, ta vẫn trả về thông báo thành công.
     * Điều này ngăn chặn kẻ xấu dò quét xem email nào đã có trên hệ thống.
     */
    if (!existingUser) {
      return NextResponse.json({ message: 'Liên kết đặt lại mật khẩu đã được gửi vào email của bạn.' }, { status: 200 })
    }

    // 3. Tạo Token reset mật khẩu duy nhất
    const token = crypto.randomUUID()
    const expires = new Date(new Date().getTime() + 3600 * 1000) // Hết hạn sau 1 giờ

    // 4. Lưu hoặc Cập nhật Token vào Database
    // Sử dụng upsert để: nếu đã có token cũ thì ghi đè, chưa có thì tạo mới
    await prisma.passwordResetToken
      .upsert({
        where: {
          email_token: {
            email: existingUser.email!,
            token: token
          }
        },
        update: {
          token: token,
          expires: expires
        },
        create: {
          email: existingUser.email!,
          token: token,
          expires: expires
        }
      })
      .catch(async () => {
        // Fallback: Nếu bảng của bạn không có unique composite, hãy dùng deleteMany + create
        await prisma.passwordResetToken.deleteMany({ where: { email: existingUser.email! } })
        await prisma.passwordResetToken.create({
          data: { email: existingUser.email!, token, expires }
        })
      })

    // 5. Gửi Email thực tế qua Nodemailer
    // Sử dụng trường name của user để chào hỏi trong email cho chuyên nghiệp
    await sendPasswordResetEmail(existingUser.email!, existingUser.name || 'Thành viên', token)

    return NextResponse.json({ message: 'Liên kết đặt lại mật khẩu đã được gửi vào email của bạn.' }, { status: 200 })
  } catch (error) {
    console.error('FORGOT_PASSWORD_ERROR:', error)

    return NextResponse.json({ error: 'internal server error' }, { status: 500 })
  }
}
