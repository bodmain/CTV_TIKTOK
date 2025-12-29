import GoogleProvider from 'next-auth/providers/google'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
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

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {},
      authorize: async credentials => {
        try {
          const { email, password, userAgentHeader, ipAddress, location } = credentials as {
            email: string
            password: string
            userAgentHeader: string
            ipAddress: string
            location: string
          }

          // 1. Kiểm tra người dùng tồn tại
          const user = await prisma.user.findUnique({
            where: {
              email: email.toLowerCase()
            }
          })

          // 2. Kiểm tra người dùng và mật khẩu
          // Nếu người dùng không tồn tại HOẶC người dùng tồn tại nhưng không có mật khẩu (Đăng nhập OAuth)
          if (!user || !user.password) {
            return null
          }

          // 3. So sánh mật khẩu
          // Dùng mật khẩu đã băm (user.password) và mật khẩu người dùng nhập (password)
          const isPasswordValid = await bcrypt.compare(password, user.password)

          if (!isPasswordValid) {
            return null
          }

          // 4. Kiểm tra khóa tài khoản
          if (user.status === AccountStatus.LOCKED) {
            return null
          }

          // 5. Kiểm tra tài khoản cơ bản
          if (user.status === AccountStatus.SUSPENDED) {
            return null
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
          return userResponse
        } catch (error) {
          console.error('Login Error (Unexpected):', error)

          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && token.email) {
        // Fetch updated user from DB using token.email
        const updatedUser = await prisma.user.findUnique({
          where: { email: token.email as string }
        })

        if (updatedUser) {
          token.name = updatedUser.name
          token.email = updatedUser.email
          token.phone = updatedUser.phone
          token.address = updatedUser.address
          token.tax = updatedUser.tax
          token.province = updatedUser.province
          token.ward = updatedUser.ward
          token.image = updatedUser.image
        }
      } else if (user) {
        token.name = (user as any).name
        token.email = (user as any).email
        token.phone = (user as any).phone
        token.tax = (user as any).tax
        token.province = (user as any).province
        token.ward = (user as any).ward
        token.address = (user as any).address
        token.status = (user as any).status
        token.image = (user as any).image
      }

      return token
    },

    // 2. SESSION: Chuyển dữ liệu từ Token ra ngoài cho UserDropdown dùng
    // (BẠN ĐANG THIẾU CÁI NÀY)
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string
        session.user.email = token.email as string

        // ... map các trường khác (phone, tax...)

        // !!! DÒNG QUAN TRỌNG NHẤT !!!
        // Gán ảnh từ Token (đã update) vào Session
        session.user.image = token.image as string
      }
      return session
    }
  }
})
