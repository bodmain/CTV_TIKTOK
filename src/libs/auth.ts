import GoogleProvider from 'next-auth/providers/google'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { prisma } from '@/libs/prisma'

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

          const body: any = { email, password, userAgentHeader, ipAddress, location }

          const res = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          })

          const data = await res.json()

          if (res.status === 200) {
            // Chuẩn hóa dữ liệu user trả về
            return data
          } else {
            // Trả về null để NextAuth hiểu là đăng nhập thất bại
            return null
          }
        } catch (e: any) {
          throw new Error(e.message)
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
      if (trigger === 'update' && session) {
        // Bạn có thể fetch lại user từ DB ở đây để đảm bảo dữ liệu mới nhất
        const updatedUser = await prisma.user.findUnique({
          where: { email: session.user.email }
        })

        if (updatedUser) {
          token.name = updatedUser.name
          token.email = updatedUser.email
          token.phone = updatedUser.phone
          token.address = updatedUser.address
          token.tax = updatedUser.tax
          token.province = updatedUser.province
          token.ward = updatedUser.ward
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
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.phone = token.phone as string
        session.user.tax = token.tax as string
        session.user.province = token.province as string
        session.user.ward = token.ward as string
        session.user.address = token.address as string
        session.user.status = token.status as string
      }

      return session
    }
  }
})
