'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import classnames from 'classnames'

// Type Imports
import DirectionalIcon from '@components/DirectionalIcon'
import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

type ErrorType = {
  message: string[]
}

const schema = object({
  email: pipe(string(), minLength(1, 'Bạn chưa nhập email'), email('Vui lòng nhập địa chỉ email hợp lệ'))
})

type FormData = InferInput<typeof schema>

const ForgotPassword = ({ mode }: { mode: Mode }) => {
  // States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [isSuccess, setIsSuccess] = useState(false) // Trạng thái gửi thành công

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-4-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-4-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-forgot-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-forgot-password-light-border.png'

  // Hooks
  const { settings } = useSettings()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: ''
    }
  })

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    setErrorState(null)
    setIsSuccess(false)
    setIsSubmitting(true)

    try {
      // Gọi API forgot-password bạn đã viết bằng Prisma
      const apiRes = await fetch('api/auth/forgot-password-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await apiRes.json()

      console.log(result)

      if (apiRes.status === 200) {
        setIsSuccess(true) // Hiện thông báo thành công
      } else {
        setErrorState({ message: [result.error || 'Đặt lại mật khẩu thất bại'] })
      }
    } catch {
      setErrorState({ message: ['internal server error'] })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames('flex items-center justify-center bs-full flex-1 min-bs-dvh relative p-6 max-md:hidden', {
          'border-ie': settings.skin === 'bordered'
        })}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[677px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper min-is-full p-6 md:min-is-[unset] md:p-12 md:is-[480px]'>
        <Link href={'/'} className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          {isSuccess ? (
            <>
              <Typography variant='h5' className='mb-2 text-blue-800 text-center'>
                Liên kết đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra email của bạn.
              </Typography>
              <Typography className='flex justify-center items-center' color='primary.main'>
                <Link href='/login' className='flex items-center gap-1.5'>
                  <DirectionalIcon
                    ltrIconClass='ri-arrow-left-s-line'
                    rtlIconClass='ri-arrow-right-s-line'
                    className='text-xl'
                  />
                  <span>Quay lại đăng nhập</span>
                </Link>
              </Typography>
            </>
          ) : (
            <>
              <div>
                <Typography variant='h4'>Quên mật khẩu 🔒</Typography>
                <Typography className='mbs-1'>
                  Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn để đặt lại mật khẩu
                </Typography>
              </div>
              {errorState && (
                <Typography variant='body2' color='error' className='mt-4 mb-4 text-error text-center'>
                  {errorState.message[0] || 'Lỗi đăng ký không xác định.'}
                </Typography>
              )}

              <form
                noValidate
                action={() => {}}
                autoComplete='off'
                onSubmit={handleSubmit(onSubmit)}
                className='flex flex-col gap-5'
              >
                <Controller
                  name='email'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      autoFocus
                      type='email'
                      label='Email'
                      disabled={isSubmitting || isSuccess} // Khóa input khi đang gửi hoặc đã gửi xong
                      {...(errors.email && {
                        error: true,
                        helperText: errors.email.message
                      })}
                    />
                  )}
                />
                <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className='flex items-center gap-2'>
                      <CircularProgress size={20} color='inherit' />
                      <span>Đang yêu cầu..</span>
                    </div>
                  ) : (
                    'Gửi liên kết đặt lại mật khẩu'
                  )}
                </Button>
                <Typography className='flex justify-center items-center' color='primary.main'>
                  <Link href='/login' className='flex items-center gap-1.5'>
                    <DirectionalIcon
                      ltrIconClass='ri-arrow-left-s-line'
                      rtlIconClass='ri-arrow-right-s-line'
                      className='text-xl'
                    />
                    <span>Quay lại đăng nhập</span>
                  </Link>
                </Typography>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
