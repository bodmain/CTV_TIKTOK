import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      name?: string
      email?: string
      phone?: string | null
      tax?: string | null
      province?: string | null
      ward?: string | null
      status?: string | null
      address?: string | null
      role?: string | null
      image?: string
    } & DefaultSession['user']
  }

  interface User {
    id?: string
    name?: string
    email?: string
    phone?: string | null
    tax?: string | null
    province?: string | null
    ward?: string | null
    status?: string | null
    address?: string | null
    role?: string | null
    image?: string
  }
}
