'use client'

// Next Imports
import { useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

const VerifyEmail = ({ mode }: { mode: Mode }) => {
  // Vars
  const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-1-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-verify-email-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-verify-email-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-verify-email-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-verify-email-light-border.png'

  // Hooks
  const { settings } = useSettings()
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  useEffect(() => {
    if (!email) return

    // Thiết lập "tai lắng nghe" cứ 3 giây hỏi 1 lần
    const listener = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/check-verify-status?email=${email}`)
        const data = await res.json()

        if (data.verified) {
          clearInterval(listener) // Dừng lắng nghe
          router.push('/login') // Chuyển hướng ngay lập tức
        }
      } catch {}
    }, 3000)

    return () => clearInterval(listener) // Cleanup khi thoát trang
  }, [email, router])

  const handleSkip = async () => {
    const redirectURL = searchParams.get('redirectTo') ?? '/login'

    router.replace(redirectURL)
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames('flex bs-full items-center justify-center flex-1 min-bs-dvh relative p-6 max-md:hidden', {
          'border-ie': settings.skin === 'bordered'
        })}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[673px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper min-is-full! p-6 md:min-is-[unset]! md:p-12 md:is-[480px]'>
        <Link href={'/'} className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:start-[38px]'>
          <Logo />
        </Link>

        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div>
            <Typography variant='h4'>Xá nhận email của bạn</Typography>
            <Typography className='mbs-1'>
              Liên kết kích hoạt tài khoản đã được gửi tới địa chỉ email của bạn:{' '}
              <span className='font-medium text-textPrimary'>{email}</span> Vui lòng nhấp vào liên kết trong email để
              tiếp tục.
            </Typography>
          </div>
          <Button fullWidth onClick={handleSkip} variant='contained' type='submit'>
            Bỏ qua bước này
          </Button>
          <div className='flex justify-center items-center flex-wrap gap-2'>
            <Typography>Bạn chưa nhận được email?</Typography>
            <Typography color='primary.main' component={Link}>
              Gửi lại
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
