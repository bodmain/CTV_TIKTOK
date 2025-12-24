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
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty, boolean, literal } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

type ErrorType = {
  message: string[]
}

type FormData = InferInput<typeof schema>

const schema = object({
  name: pipe(string(), nonEmpty('Bạn chưa nhập tên'), minLength(3, 'Tên cần tối thiểu 3 ký tự')),
  email: pipe(string(), minLength(1, 'Bạn chưa nhập email'), email('Vui lòng nhập địa chỉ email hợp lệ')),
  password: pipe(string(), nonEmpty('Bạn chưa nhập mật khẩu'), minLength(5, 'Mật khẩu cần tối thiểu 5 ký tự')),
  isTermsChecked: pipe(
    boolean(),
    literal(true, 'Bạn phải đồng ý với Chính sách bảo mật & Điều khoản để tiếp tục') // Yêu cầu giá trị phải là 'true'
  )
})

const Register = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-2-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-2-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { settings } = useSettings()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      isTermsChecked: true
    }
  })

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isRegistrationSuccess) {
      // Kích hoạt bộ đếm thời gian 3 giây
      timer = setTimeout(() => {
        const redirectURL = searchParams.get('redirectTo') ?? '/login'

        router.replace(redirectURL)
      }, 3000)
    }

    // Dọn dẹp bộ đếm thời gian khi component unmount hoặc state thay đổi
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isRegistrationSuccess, router, searchParams])

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    setErrorState(null)
    setIsSubmitting(true)

    try {
      const apiRes = await fetch('api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await apiRes.json()

      if (apiRes.status === 200) {
        const verifyEnabled = result.verifyEnabled

        if (verifyEnabled) {
          router.replace(`verify-email?email=${data.email}`)
        } else {
          setIsRegistrationSuccess(true)
        }
      } else {
        setErrorState({ message: [result.message || 'Đăng ký thất bại'] })
      }
    } catch {
      setErrorState({ message: ['Internal server error'] })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleRegister = async () => {
    setIsGoogleSubmitting(true)
    setErrorState(null) // Xóa lỗi form hiện tại

    try {
      await signIn('google', { redirect: true })
    } catch {
      setErrorState({ message: ['Internal server error'] })
    } finally {
      setIsGoogleSubmitting(false)
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
            className='max-bs-[650px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper min-is-full! p-6 md:min-is-[unset]! md:p-12 md:is-[480px]'>
        <Link href={'/'} className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:start-[38px]'>
          <Logo />
        </Link>

        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          {isRegistrationSuccess ? (
            <div className='flex flex-col items-center'>
              <Typography variant='h4' className='mb-2 text-blue-800 text-center'>
                Đăng ký thành công!
              </Typography>
              <Typography variant='body1' className='text-sm text-center mt-4'>
                Bạn sẽ được chuyển hướng trang sau 3 giây...
              </Typography>
            </div>
          ) : (
            <>
              <div>
                <Typography variant='h4'>Bắt đầu trải nghiệm 🚀</Typography>
                <Typography className='mbs-1'>Biến việc quản lý thành trải nghiệm thú vị!</Typography>
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
                  name='name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      autoFocus
                      type='text'
                      label='Họ tên'
                      onChange={e => {
                        field.onChange(e.target.value)
                        errorState !== null && setErrorState(null)
                      }}
                      {...(errors.name && {
                        error: true,
                        helperText: errors.name.message
                      })}
                    />
                  )}
                />
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

                <div className='flex justify-between items-center gap-3'>
                  <Controller
                    name='isTermsChecked'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <div className='flex flex-col'>
                        <FormControlLabel
                          control={<Checkbox checked={field.value} onChange={field.onChange} />}
                          label={
                            <>
                              <span>Tôi đồng ý với </span>
                              <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                                Chính sách & Điều khoản
                              </Link>
                            </>
                          }
                        />
                        {errors.isTermsChecked && (
                          <Typography color='error' variant='body2' className='mis-8 text-error'>
                            {errors.isTermsChecked.message}
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                </div>
                <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className='flex items-center gap-2'>
                      <CircularProgress size={20} color='inherit' />
                      <span>Đang đăng ký...</span>
                    </div>
                  ) : (
                    'Đăng ký'
                  )}
                </Button>
                <div className='flex justify-center items-center flex-wrap gap-2'>
                  <Typography>Bạn đã có tài khoản?</Typography>
                  <Typography component={Link} href='/login' color='primary.main'>
                    Đăng nhập
                  </Typography>
                </div>
                <Divider className='gap-3 text-textPrimary'>Hoặc</Divider>
                <div className='flex justify-center items-center gap-2'>
                  <IconButton
                    size='medium'
                    className='text-googlePlus'
                    onClick={handleGoogleRegister} // Gắn hàm xử lý
                    disabled={isGoogleSubmitting} // Dùng state mới
                  >
                    {isGoogleSubmitting ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      <i className='ri-google-fill' />
                    )}
                  </IconButton>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register
