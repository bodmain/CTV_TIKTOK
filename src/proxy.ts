import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { auth } from '@/libs/auth'

// Các Route (không cần xác thực)
const publicPaths = [
  '/login',
  '/register',
  '/verify-email',
  '/new-verification',
  '/forgot-password',
  '/reset-password',
  '/new-password',
  '/auth-callback'
]

const isPublicPath = (path: string) => {
  if (path.startsWith('/api/')) {
    return true // Bỏ qua tất cả các API của Auth.js
  }

  return publicPaths.includes(path)
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublic = isPublicPath(path)

  const session = await auth()

  const isLoggedIn = !!session

  // 1. Nếu ĐÃ ĐĂNG NHẬP
  if (isPublic && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  // 2. Nếu CHƯA ĐĂNG NHẬP
  if (!isLoggedIn && !isPublic) {
    const url = new URL('/login', request.nextUrl)

    url.searchParams.set('redirectTo', path)

    return NextResponse.redirect(url)
  }

  // Mặc định: Cho phép đi tiếp
  return NextResponse.next()
}

export const config = {
  // Bảo vệ tất cả các tuyến đường trừ /api, _next/static, _next/image, và assets
  // Lưu ý: Nếu bạn có thư mục public khác, hãy thêm nó vào đây (ví dụ: |/icons)
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|icons|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|map|json|woff|woff2|ttf|eot)).*)'
  ]
}
