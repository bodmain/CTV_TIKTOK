'use client'

import { useEffect, useState, useCallback } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { FormControlLabel, Switch, CircularProgress } from '@mui/material'

// Third-party Imports
import type { ToastOptions } from 'react-toastify'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Security = () => {
  // Hooks
  const theme = useTheme()

  // States
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<boolean>(true)

  // 1. Hàm tạo Style Toast theo Template của bạn
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
        // Bạn có thể điều chỉnh endpoint này để lấy tất cả config cần thiết
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/settings`)
        const data = await res.json()

        // Giả sử data trả về dạng object { [key]: value }
        setSettings(data)
      } catch {
        toast.error('Không thể tải cấu hình hệ thống', getToastOptions(true))
      } finally {
        setLoading(false)
      }
    }

    fetchConfigs()
  }, [getToastOptions])

  // 3. Hàm xử lý lưu tự động (Cực kỳ thông minh)
  const updateSetting = async (key: string, newValue: any) => {
    const oldValue = settings[key]

    // Cập nhật UI ngay lập tức (Optimistic Update)
    setSettings(prev => ({ ...prev, [key]: newValue }))

    // Tạo Promise để xử lý API
    const savePromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: newValue })
    }).then(async res => {
      const contentType = res.headers.get('content-type')

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Lỗi không xác định.')
      }

      if (!res.ok) throw new Error()

      return res.json()
    })

    // Hiển thị thông báo thông minh dùng Style Template
    toast.promise(savePromise, {
      pending: {
        render: `Đang cập nhật ${key}...`,
        ...getToastOptions()
      },
      success: {
        render: `Đã lưu cấu hình thành công!`,
        ...getToastOptions()
      },
      error: {
        render: 'Lỗi không xác định',
        ...getToastOptions(true),

        // Hoàn tác UI nếu lỗi
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
          <CardHeader title='Cấu hình chung hệ thống' />
          <CardContent>
            <Grid container spacing={5}>
              <Grid component='div' container spacing={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings['MAINTENANCE_MODE'] === 'true' || settings['MAINTENANCE_MODE'] === true}
                      onChange={e => updateSetting('MAINTENANCE_MODE', e.target.checked)}
                    />
                  }
                  label='Chế độ bảo trì'
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <ToastContainer position='bottom-right' autoClose={3000} theme='colored' />
    </Grid>
  )
}

export default Security
