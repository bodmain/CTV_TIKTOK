// src/views/pages/profile/connections/AddTikTokDialog.tsx
'use client'

import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import { toast } from 'react-toastify'

// Action Imports
import { addTikTokAccount } from '@/app/server/tiktok-actions'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const AddTikTokDialog = ({ open, onClose, onSuccess }: Props) => {
  // Đổi state sang dạng object để lưu cả 2 trường
  const [formData, setFormData] = useState({
    username: '', // Lưu Email/SĐT/ID
    password: '' // Lưu mật khẩu
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    // Validate: Bắt buộc phải nhập cả 2
    if (!formData.username || !formData.password) {
      toast.warning('Vui lòng nhập đầy đủ Tài khoản và Mật khẩu')
      return
    }

    setLoading(true)

    // Gửi cả object formData xuống server
    const res = await addTikTokAccount(formData)

    if (res.success) {
      toast.success('Thêm kênh thành công!')
      setFormData({ username: '', password: '' }) // Reset form
      onSuccess()
      onClose()
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle>Thêm Kênh TikTok</DialogTitle>
      <DialogContent>
        <Box className='pt-2 flex flex-col gap-4'>
          <Typography variant='body2' color='text.secondary'>
            Cung cấp thông tin đăng nhập để hệ thống tự động kết nối.
          </Typography>

          {/* 1. Ô nhập Tài khoản */}
          <TextField
            fullWidth
            autoFocus
            label='Email / Số điện thoại / ID'
            placeholder='VD: 0987654321 hoặc email@gmail.com'
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            disabled={loading}
          />

          {/* 2. Ô nhập Mật khẩu (Có nút hiện/ẩn) */}
          <TextField
            fullWidth
            label='Mật khẩu TikTok'
            type={showPassword ? 'text' : 'password'} // Logic ẩn hiện
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    edge='end'
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={e => e.preventDefault()}
                  >
                    <i className={showPassword ? 'tabler-eye' : 'tabler-eye-off'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Typography variant='caption' color='text.secondary' className='italic'>
            * Lưu ý: Hãy tắt xác thực 2 bước (2FA) để bot có thể đăng nhập ổn định.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button variant='contained' onClick={handleSubmit} disabled={loading}>
          {loading ? 'Đang thêm...' : 'Xác nhận'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddTikTokDialog
