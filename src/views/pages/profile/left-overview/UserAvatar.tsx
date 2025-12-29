// src/views/pages/profile/left-overview/UserAvatar.tsx
'use client'

import type { ChangeEvent } from 'react'
import { useState, useRef } from 'react'

// MUI Imports
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import { toast } from 'react-toastify'

import CustomAvatar from '@core/components/mui/Avatar'

// NextAuth Imports
import { useSession } from 'next-auth/react'

// Logic & Utilities
import { updateAvatar } from '@/app/server/user-actions'

export default function UserAvatar({ avatarUrl, userName }: { avatarUrl: string; userName: string }) {
  const { update } = useSession()
  const [imgSrc, setImgSrc] = useState<string>(avatarUrl)
  const [loading, setLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hàm kích hoạt click vào input ẩn
  const handleEditClick = () => {
    // --- DÒNG DEBUG BẠN YÊU CẦU ---
    console.log('Đã click vào nút bút chì! (Kiểm tra F12 -> Console)')

    // -------------------------------

    if (fileInputRef.current) {
      fileInputRef.current.click()
    } else {
      console.error('Lỗi: Không tìm thấy thẻ input file!')
    }
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    // Log xem đã chọn được file chưa
    console.log('File đã chọn:', file)

    if (!file) return

    // 1. Preview ảnh
    const previewUrl = URL.createObjectURL(file)

    setImgSrc(previewUrl)
    setLoading(true)

    try {
      // 2. Upload
      const formData = new FormData()

      formData.append('file', file)

      const response = await fetch('/api/upload-avatar/avatar', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      // 3. Update DB
      const dbResult = await updateAvatar(data.url)

      if (dbResult?.error) throw new Error(dbResult.error)

      // 4. Update session with new image
      await update({ image: data.url })

      toast.success('Cập nhật ảnh đại diện thành công!')
    } catch (error) {
      console.error('Upload Error:', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại.')
      setImgSrc(avatarUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <input
        type='file'
        accept='image/png, image/jpeg, image/jpg'
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Badge
        overlap='rectangular'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiBadge-badge': {
            bottom: '5px',
            right: '5px',
            padding: 0,
            backgroundColor: 'transparent'
          }
        }}
        badgeContent={
          <IconButton
            size='small'
            onClick={handleEditClick}
            disabled={loading}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: 'primary.main',
              color: 'common.white',
              boxShadow: 3,
              border: '2px solid',
              borderColor: 'background.paper',
              cursor: 'pointer',
              pointerEvents: 'auto', // Quan trọng: Giúp nút nhận sự kiện click
              '&:hover': { backgroundColor: 'primary.dark' },
              '&:disabled': { backgroundColor: 'action.disabledBackground' }
            }}
          >
            {loading ? (
              <CircularProgress size={18} color='inherit' />
            ) : (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4' />
                <path d='M13.5 6.5l4 4' />
              </svg>
            )}
          </IconButton>
        }
      >
        <CustomAvatar
          alt={userName}
          src={imgSrc}
          variant='rounded'
          className='rounded-lg'
          size={120}
          sx={{ boxShadow: 3, opacity: loading ? 0.7 : 1 }}
        />
      </Badge>
    </>
  )
}
