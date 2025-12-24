'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import { CircularProgress } from '@mui/material'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

type ErrorType = {
  message: string[]
}

type FormData = InferInput<typeof schema>

const schema = object({
  email: pipe(string(), minLength(1, 'Vui lòng nhập email'), email('Vui lòng nhập địa chỉ email hợp lệ')),
  password: pipe(string(), nonEmpty('Không được để trống mật khẩu'), minLength(5, 'Mật khẩu phải có ít nhất 5 ký tự'))
})

const getClientMetadata = async () => {
  // 1. Lấy User-Agent (Browser/OS)
  const userAgent = navigator.userAgent || 'Không rõ'

  // 2. Lấy IP và Location (sử dụng API client-side)
  let ipAddress = '127.0.0.1'
  let location = 'Unknown Location'

  try {
    // Sử dụng API bên ngoài (có thể bị giới hạn tần suất, ví dụ: ipify/ip-api)
    // Lưu ý: ipify chỉ trả về IP, cần gọi thêm Geo-API để lấy location.
    // Dùng API Geo-IP trực tiếp sẽ hiệu quả hơn:
    const ipApiRes = await fetch('http://ip-api.com/json/?fields=query,city,country', {
      // Đặt timeout thấp vì đây là bước tiền xử lý
      signal: AbortSignal.timeout(10000)
    })

    const ipData = await ipApiRes.json()

    if (ipData.query) {
      ipAddress = ipData.query
      location = ipData.city && ipData.country ? `${ipData.city}, ${ipData.country}` : ipAddress
    }
  } catch (error) {
    console.warn('Không thể lấy Geo-IP từ Client:', error)
  }

  return { userAgent, ipAddress, location }
}

const Login = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-1-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
  const searchParams = useSearchParams()
  const { settings } = useSettings()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: 'pson38969@gmail.com',
      password: 'Vodanh2030'
    }
  })

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async (formData: FormData) => {
    setErrorState(null)
    setIsSubmitting(true)

    try {
      const apiRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      console.log(apiRes)

      const result = await apiRes.json()

      if (apiRes.status !== 200) {
        // lấy message từ API trả về
        setErrorState({ message: [result.message || 'Đăng nhập thất bại'] })
      } else {
        const metadata = await getClientMetadata()

        // dùng dữ liệu từ form để signIn
        await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          userAgentHeader: metadata.userAgent,
          ipAddress: metadata.ipAddress,
          location: metadata.location,
          redirect: true
        })
      }
    } catch {
      setErrorState({ message: ['Internal server error'] })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true)
    setErrorState(null)

    try {
      await signIn('google', {
        callbackUrl: searchParams.get('redirectTo') ?? '/dashboard'
      })
    } catch {
      setErrorState({ message: ['Đã xảy ra lỗi không mong muốn khi đăng nhập bằng Google.'] })
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
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[673px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper min-is-full p-6 md:min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>{`Chào mừng bạn đến với ${themeConfig.templateName}! 🎉`}</Typography>
            <Typography>Đăng nhập để đồng hành cùng chúng tôi trong hành trình</Typography>
          </div>
          {errorState && (
            <Typography variant='body2' color='error' className='mt-4 mb-4 text-error text-center'>
              {errorState.message[0] || 'Lỗi đăng nhập không xác định.'}
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
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type='email'
                  label='Email'
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  {...(errors.email && {
                    error: true,
                    helperText: errors.email.message
                  })}
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Mật khẩu'
                  id='login-password'
                  type={isPasswordShown ? 'text' : 'password'}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                          >
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                  {...(errors.password && { error: true, helperText: errors.password.message })}
                />
              )}
            />
            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel control={<Checkbox defaultChecked />} label='Giữ tôi đăng nhập' />
              <Typography className='text-end' color='primary.main' component={Link} href={'/forgot-password'}>
                Quên mật khẩu?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <div className='flex items-center gap-2'>
                  <CircularProgress size={20} color='inherit' />
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Bạn chưa có tài khoản?</Typography>
              <Typography component={Link} href={'/register'} color='primary.main'>
                Đăng ký ngay
              </Typography>
            </div>
          </form>
          <Divider className='gap-3'>Hoặc</Divider>
          <Button
            color='secondary'
            className='self-center text-textPrimary'
            startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
            sx={{ '& .MuiButton-startIcon': { marginInlineEnd: 3 } }}
            onClick={handleGoogleSignIn}
          >
            {isSubmitting ? (
              <div className='flex items-center gap-2'>
                <CircularProgress size={20} color='inherit' />
                <span>Đang đăng nhập...</span>
              </div>
            ) : (
              'Đăng nhập bằng Google'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Login
