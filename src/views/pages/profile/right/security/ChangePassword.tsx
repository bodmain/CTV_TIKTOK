'use client'

// React Imports
import { useState, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, pipe, forward, check } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import type { ToastOptions } from 'react-toastify'
import { ToastContainer, toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import { useTheme } from '@mui/material/styles'

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

const ChangePassword = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const theme = useTheme()

  const getToastOptions = useCallback(
    (isError = false): ToastOptions => ({
      style: {
        padding: '16px',
        color: isError ? theme.palette.error.main : theme.palette.primary.main,
        border: `1px solid ${isError ? theme.palette.error.main : theme.palette.primary.main}`,
        backgroundColor: theme.palette.background.paper
      },
      className: 'custom-toast',
      closeButton: false
    }),
    [theme]
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      password: '',
      confirm_password: ''
    }
  })

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const apiRes = await fetch('/api/pages/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: data.password
        })
      })

      const result = await apiRes.json()

      if (apiRes.ok) {
        reset()
        toast.success(result.message, getToastOptions())
      } else {
        toast.error(result.error, getToastOptions(true))
      }
    } catch {
      toast.error('Internal Server Error', getToastOptions(true))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Đổi mật khẩu' />
      <CardContent className='flex flex-col gap-4'>
        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={5}>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name='confirm_password'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Nhập lại mật khẩu mới'
                        type={isConfirmPasswordShown ? 'text' : 'password'}
                        error={!!errors.confirm_password}
                        helperText={errors.confirm_password?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                                  edge='end'
                                >
                                  <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                                </IconButton>
                              </InputAdornment>
                            )
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12 }} className='flex justify-end'>
              <Button variant='contained' type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className='flex items-center gap-2'>
                    <CircularProgress size={20} color='inherit' />
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  'Đổi mật khẩu'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
      <ToastContainer position='bottom-right' autoClose={3000} theme='colored' />
    </Card>
  )
}

export default ChangePassword
