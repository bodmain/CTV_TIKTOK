'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, pipe, forward, check } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

type ErrorType = {
  message: string[]
}

// 1. Schema chuẩn cho Reset Password
const schema = pipe(
  object({
    password: pipe(string(), minLength(5, 'Mật khẩu cần tối thiểu 5 ký tự')),
    confirm_password: pipe(string(), minLength(1, 'Vui lòng xác nhận mật khẩu'))
  }),
  forward(
    check(input => input.password === input.confirm_password, 'Mật khẩu xác nhận không khớp'),
    ['confirm_password']
  )
)

type FormData = InferInput<typeof schema>

const ResetPassword = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [isResetSuccess, setIsResetSuccess] = useState(false)

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') // Lấy token từ URL
  const { settings } = useSettings()

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-3-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-3-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-reset-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-reset-password-light.png'
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(mode, lightIllustration, darkIllustration)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      password: '',
      confirm_password: ''
    }
  })

  useEffect(() => {
    if (isResetSuccess) {
      const timer = setTimeout(() => {
        router.replace('/login')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isResetSuccess, router])

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (!token) {
      setErrorState({ message: ['Mã xác thực không tồn tại. Vui lòng kiểm tra lại email.'] })

      return
    }

    setErrorState(null)
    setIsSubmitting(true)

    try {
      const apiRes = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password
        })
      })

      const result = await apiRes.json()

      if (apiRes.ok) {
        setIsResetSuccess(true)
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
        className={classnames('flex bs-full items-center justify-center flex-1 min-bs-dvh relative p-6 max-md:hidden', {
          'border-ie': settings.skin === 'bordered'
        })}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img src={characterIllustration} alt='illustration' className='max-bs-[703px] max-is-full bs-auto' />
        </div>
        <img src={authBackground} className='absolute z-[-1] bottom-[4%] is-full max-md:hidden' />
      </div>

      <div className='flex justify-center items-center bs-full bg-backgroundPaper min-is-full! p-6 md:min-is-[unset]! md:p-12 md:is-[480px]'>
        <Link href='/' className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:start-[38px]'>
          <Logo />
        </Link>

        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          {isResetSuccess ? (
            <div className='flex flex-col items-center gap-4'>
              <Typography variant='h4' className='mb-2 text-blue-800 text-center'>
                Mật khẩu đã được đặt lại thành công!
              </Typography>
              <Typography className='text-center'>Hệ thống sẽ chuyển bạn về trang đăng nhập sau 3 giây...</Typography>
            </div>
          ) : (
            <>
              <div>
                <Typography variant='h4'>Đặt lại mật khẩu 🔒</Typography>
                <Typography className='mbs-1'>Vui lòng nhập mật khẩu mới để tiếp tục truy cập tài khoản.</Typography>
              </div>

              {errorState && (
                <Typography variant='body2' color='error' className='mt-4 mb-4 text-error text-center'>
                  {errorState.message[0] || 'Lỗi đăng ký không xác định.'}
                </Typography>
              )}

              <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
                <Controller
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Mật khẩu mới'
                      type={isPasswordShown ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton onClick={() => setIsPasswordShown(!isPasswordShown)} edge='end'>
                                <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  )}
                />

                <Controller
                  name='confirm_password'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Xác nhận mật khẩu'
                      type={isConfirmPasswordShown ? 'text' : 'password'}
                      error={!!errors.confirm_password}
                      helperText={errors.confirm_password?.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)} edge='end'>
                                <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  )}
                />

                <Button fullWidth variant='contained' type='submit' disabled={isSubmitting || !token}>
                  {isSubmitting ? (
                    <div className='flex items-center gap-2'>
                      <CircularProgress size={20} color='inherit' />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    'Đặt mật khẩu mới'
                  )}
                </Button>

                <Typography className='flex justify-center items-center' color='primary.main'>
                  <Link href='/login' className='flex items-center gap-1.5'>
                    <DirectionalIcon
                      ltrIconClass='ri-arrow-left-s-line'
                      rtlIconClass='ri-arrow-right-s-line'
                      className='text-xl'
                    />
                    <span>Quay lại trang đăng nhập</span>
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

export default ResetPassword
