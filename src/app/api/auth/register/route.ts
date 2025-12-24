// route.ts
import crypto from 'crypto' // Thêm import này

import { NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'

import { prisma } from '@/libs/prisma'
import { getSetting } from '@/utils/string'
import { sendVerificationEmail } from '@/mail-templete/verify'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    // 1. Kiểm tra đầu vào
    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Vui lòng điền đầy đủ thông tin.' }, { status: 400 })
    }

    // 2. Kiểm tra tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Địa chỉ email này đã được sử dụng.' }, { status: 409 })
    }

    // 3. Băm mật khẩu
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 4. Tạo người dùng
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'CLIENT'
      }
    })

    // 5. Logic xác thực Email
    const verifyEnabled = await getSetting('VERIFY_EMAIL') // Sử dụng đúng hàm đã import

    if (verifyEnabled) {
      try {
        const token = crypto.randomUUID()
        const expires = new Date(Date.now() + 3600000 * 24) // 24 giờ

        // Lưu Token vào bảng riêng như đã thảo luận
        await prisma.verificationToken.create({
          data: {
            email: newUser.email as string,
            token: token,
            expires: expires
          }
        })

        // Gửi mail bằng Gmail SMTP
        await sendVerificationEmail(email, name, token)
      } catch (mailError) {
        console.error('Lỗi gửi mail xác thực:', mailError)
      }
    }

    return NextResponse.json(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        verifyEnabled: verifyEnabled
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Register Error:', error)

    return NextResponse.json({ message: 'Không thể đăng ký. Vui lòng thử lại.' }, { status: 500 })
  }
}
