'use client'

import { useEffect, useState, useCallback } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { CircularProgress, TextField } from '@mui/material'

// Third-party Imports
import type { ToastOptions } from 'react-toastify'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Company = () => {
  // Hooks
  const theme = useTheme()

  // States
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<boolean>(true)

  // 1. Hàm tạo Style Toast theo Template
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

  // 2. Load cấu hình khi vào trang
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/settings`)
        const data = await res.json()

        setSettings(data)
      } catch {
        toast.error('Không thể tải cấu hình hệ thống', getToastOptions(true))
      } finally {
        setLoading(false)
      }
    }

    fetchConfigs()
  }, [getToastOptions])

  // 3. Hàm xử lý lưu tự động
  const updateSetting = async (key: string, newValue: any) => {
    const oldValue = settings[key]

    // Không gửi request nếu giá trị không đổi
    if (oldValue === newValue) return

    setSettings(prev => ({ ...prev, [key]: newValue }))

    const savePromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: newValue })
    }).then(async res => {
      const contentType = res.headers.get('content-type')

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server không phản hồi đúng định dạng.')
      }

      if (!res.ok) throw new Error()

      return res.json()
    })

    toast.promise(savePromise, {
      pending: { render: `Đang lưu ${key}...`, ...getToastOptions() },
      success: { render: `Đã cập nhật thành công!`, ...getToastOptions() },
      error: {
        render: 'Lỗi không thể lưu dữ liệu',
        ...getToastOptions(true),
        onClose: () => setSettings(prev => ({ ...prev, [key]: oldValue }))
      }
    })
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center p-12'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Thông tin doanh nghiệp & Hệ thống' />
          <CardContent>
            <div className='flex flex-col gap-5'>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Tên thương hiệu (Site Name)'
                  defaultValue={settings['SITE_NAME'] || ''}
                  onBlur={e => updateSetting('SITE_NAME', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Số điện thoại hỗ trợ'
                  defaultValue={settings['COMPANY_HOTLINE'] || ''}
                  onBlur={e => updateSetting('COMPANY_HOTLINE', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='Địa chỉ văn phòng'
                  defaultValue={settings['COMPANY_ADDRESS'] || ''}
                  onBlur={e => updateSetting('COMPANY_ADDRESS', e.target.value)}
                />
              </Grid>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <ToastContainer position='bottom-right' autoClose={3000} theme='colored' />
    </Grid>
  )
}

export default Company
