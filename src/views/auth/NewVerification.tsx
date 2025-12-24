'use client'

import { useEffect, useState, useRef } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Type Imports
import type { SystemMode } from '@core/types'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

const NewVerification = ({ mode }: { mode: SystemMode }) => {
  // Vars
  const darkImg = '/images/pages/misc-mask-3-dark.png'
  const lightImg = '/images/pages/misc-mask-3-light.png'

  // Hooks
  const miscBackground = useImageVariant(mode, lightImg, darkImg)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  // States
  const [error, setError] = useState<string | undefined>(undefined)
  const [success, setSuccess] = useState<string | undefined>(undefined)

  // Ref để ngăn gọi API 2 lần do Strict Mode
  const triggered = useRef(false)

  useEffect(() => {
    // 1. Kiểm tra token ngay lập tức
    if (!token) {
      setError('Thiếu mã xác thực (Token)!')

      return
    }

    // 2. Nếu đã gọi rồi thì không gọi lại
    if (triggered.current) return
    triggered.current = true

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/new-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await res.json()

        if (res.ok) {
          setSuccess('Email của bạn đã được xác thực thành công!')

          // Chuyển hướng sau 3 giây
          setTimeout(() => router.push('/login'), 3000)
        } else {
          setError(data.error || 'Token không hợp lệ hoặc đã hết hạn.')
        }
      } catch {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.')
      }
    }

    verify()
  }, [token, router])

  return (
    <div className='flex flex-col items-center justify-center min-bs-dvh relative is-full p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center gap-6 z-10'>
        <Box className='flex flex-col gap-4 items-center'>
          <Typography variant='h4' fontWeight='bold'>
            Xác nhận Email
          </Typography>

          {/* Hiển thị Loading khi đang chờ */}
          {!error && !success && (
            <Box className='flex flex-col items-center gap-4'>
              <CircularProgress size={40} />
              <Typography color='text.secondary'>Hệ thống đang kiểm tra mã xác thực của bạn...</Typography>
            </Box>
          )}

          {/* Hiển thị Thông báo Lỗi */}
          {error && <Typography className='mbe-10 text-error'>{error}</Typography>}

          {/* Hiển thị Thông báo Thành công */}
          {success && <Typography className='mbe-10 text-blue-800'>{success}</Typography>}
        </Box>

        <img
          alt='illustration'
          src='/images/illustrations/characters/5.png'
          className='object-cover bs-[300px] md:bs-[400px]'
        />
      </div>

      {/* Background Mask */}
      <img src={miscBackground} alt='mask' className='absolute bottom-0 z-[-1] is-full max-md:hidden opacity-50' />
    </div>
  )
}

export default NewVerification
