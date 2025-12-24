import { NextResponse } from 'next/server'

import { auth } from '@/libs/auth'
import { prisma } from '@/libs/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone, address, taxId, province, ward } = body

    // Bắt lỗi phía Server: Kiểm tra các trường bắt buộc
    if (!name || !phone) {
      return NextResponse.json({ error: 'Họ tên và số điện thoại là bắt buộc' }, { status: 400 })
    }

    // Cập nhật vào Database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone,
        address,
        tax: taxId, // Map taxId từ form vào cột tax trong DB
        province,
        ward
      }
    })

    return NextResponse.json({ message: 'Cập nhật thành công', user: updatedUser }, { status: 200 })
  } catch (error) {
    console.error('UPDATE_USER_ERROR:', error)

    return NextResponse.json({ error: 'Lỗi khi cập nhật thông tin' }, { status: 500 })
  }
}
