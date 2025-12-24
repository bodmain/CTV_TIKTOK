// Next Imports
import { NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'

import { prisma } from '@/libs/prisma'

enum AccountStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  SUSPENDED = 'SUSPENDED'
}

interface ParsedUserAgent {
  browser: string
  os: string
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Other'
}

function parseUserAgent(userAgent: string): ParsedUserAgent {
  const ua = userAgent.toLowerCase()
  let browser: string = 'Unknown Browser'
  let os: string = 'Unknown OS'
  let deviceType: ParsedUserAgent['deviceType'] = 'Desktop'

  // Browser
  if (ua.includes('edg')) {
    browser = 'Microsoft Edge'
  } else if (ua.includes('opr') || ua.includes('opera')) {
    browser = 'Opera'
  } else if (ua.includes('chrome')) {
    browser = 'Chrome'
  } else if (ua.includes('safari')) {
    browser = 'Safari'
  } else if (ua.includes('firefox')) {
    browser = 'Firefox'
  } else if (ua.includes('msie') || ua.includes('trident')) {
    browser = 'Internet Explorer'
  }

  // OS
  if (ua.includes('windows')) {
    os = 'Windows'
  } else if (ua.includes('android')) {
    os = 'Android'
  } else if (ua.includes('ipad')) {
    os = 'iPadOS'
  } else if (ua.includes('iphone') || ua.includes('ios')) {
    os = 'iOS'
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    os = 'macOS'
  } else if (ua.includes('linux')) {
    os = 'Linux'
  } else if (ua.includes('x11')) {
    os = 'Unix/Linux'
  }

  // Device type
  if (ua.includes('ipad') || ua.includes('tablet')) {
    deviceType = 'Tablet'
  } else if (ua.includes('mobile')) {
    deviceType = 'Mobile'
  } else if (ua.includes('tv') || ua.includes('smarttv')) {
    deviceType = 'Other'
  }

  return { browser, os, deviceType }
}

export async function POST(req: Request) {
  try {
    const { email, password, userAgentHeader, ipAddress, location } = await req.json()

    // 1. Kiểm tra người dùng tồn tại
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      }
    })

    // 2. Kiểm tra người dùng và mật khẩu
    // Nếu người dùng không tồn tại HOẶC người dùng tồn tại nhưng không có mật khẩu (Đăng nhập OAuth)
    if (!user || !user.password) {
      return NextResponse.json({ message: 'Thông tin đăng nhập không hợp lệ.' }, { status: 401 })
    }

    // 3. So sánh mật khẩu
    // Dùng mật khẩu đã băm (user.password) và mật khẩu người dùng nhập (password)
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Thông tin đăng nhập không hợp lệ.' }, { status: 401 })
    }

    // 4. Kiểm tra khóa tài khoản
    if (user.status === AccountStatus.LOCKED) {
      return NextResponse.json({ message: 'Tài khoản đã bị khóa vĩnh viễn. Vui lòng liên hệ hỗ trợ.' }, { status: 401 })
    }

    // 5. Kiểm tra tài khoản cơ bản
    if (user.status === AccountStatus.SUSPENDED) {
      return NextResponse.json(
        { message: 'Tài khoản bị đình chỉ. Vui lòng kiểm tra email để biết chi tiết.' },
        { status: 401 }
      )
    }

    if (userAgentHeader) {
      // 1. Lấy User-Agent từ Request Headers
      const parsedUA = parseUserAgent(userAgentHeader)

      // Ghi log vào DB
      await prisma.loginLog.create({
        data: {
          userId: user.id,
          ipAddress: ipAddress,
          browser: parsedUA.browser,
          os: parsedUA.os,
          deviceType: parsedUA.deviceType,
          location: location,
          activityType: 'LOGIN_SUCCESS'
        }
      })
    }

    // 6. Loại bỏ password trước khi trả về dữ liệu cho NextAuth
    const userResponse: any = { ...user }

    delete userResponse.password

    // 7. Trả về kết quả thành công
    return NextResponse.json(userResponse, { status: 200 })
  } catch (error) {
    console.error('Login Error (Unexpected):', error)

    return NextResponse.json({ message: 'Lỗi không xác định.' }, { status: 500 })
  }
}
