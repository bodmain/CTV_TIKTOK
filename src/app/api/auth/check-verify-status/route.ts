// Next Imports
import { NextResponse } from 'next/server'

import { prisma } from '@/libs/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (email) {
      const user = await prisma.user.findUnique({
        where: {
          email: email
        },
        select: {
          emailVerified: true
        }
      })

      return NextResponse.json({ verified: user?.emailVerified ?? false }, { status: 200 })
    } else {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 })
    }
  } catch (error) {
    console.error('Check email verify status error:', error)

    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 })
  }
}
