'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
// Thay Grid bằng Stack và Box
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingIcon from '@mui/icons-material/HourglassEmpty'
import ErrorIcon from '@mui/icons-material/Error'

// Logic
import { toast } from 'react-toastify'
import { getKYCStatus, submitKYC } from '@/app/server/kyc-actions'

// Hàm upload
const uploadToCloudinary = async (file: File) => {
  const CLOUD_NAME = 'duplc7ytd'
  const UPLOAD_PRESET = 'ctv_kyc_upload'

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    return data.secure_url as string
  } catch (e) {
    return null
  }
}

const KYCTab = () => {
  const [loading, setLoading] = useState(false)
  const [kycData, setKycData] = useState<any>(null)

  const [fullName, setFullName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState<string>('')
  const [backPreview, setBackPreview] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const data = await getKYCStatus()
    if (data) {
      setKycData(data)
      setFullName(data.fullName)
      setIdNumber(data.idNumber)
      if (data.imageFront) setFrontPreview(data.imageFront)
      if (data.imageBack) setBackPreview(data.imageBack)
    }
  }

  const handleSubmit = async () => {
    if (!fullName.trim() || !idNumber.trim()) {
      return toast.warning('Vui lòng nhập họ tên và số giấy tờ')
    }
    if (!kycData?.imageFront && !frontFile) return toast.warning('Thiếu ảnh mặt trước')
    if (!kycData?.imageBack && !backFile) return toast.warning('Thiếu ảnh mặt sau')

    setLoading(true)

    try {
      let frontUrl = kycData?.imageFront || ''
      let backUrl = kycData?.imageBack || ''

      if (frontFile) {
        const url = await uploadToCloudinary(frontFile)
        if (!url) throw new Error('Lỗi upload ảnh mặt trước')
        frontUrl = url
      }

      if (backFile) {
        const url = await uploadToCloudinary(backFile)
        if (!url) throw new Error('Lỗi upload ảnh mặt sau')
        backUrl = url
      }

      const res = await submitKYC({ fullName, idNumber, frontUrl, backUrl })

      if (res.success) {
        toast.success('Gửi hồ sơ thành công!')
        loadData()
      } else {
        toast.error(res.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  // Component UploadBox (Giữ nguyên)
  const UploadBox = ({ label, preview, setFile, setPreview, disabled }: any) => (
    <Box
      className='border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all relative overflow-hidden'
      sx={{
        borderColor: 'divider',
        height: 200,
        bgcolor: 'background.paper',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto'
      }}
      component='label'
    >
      <input
        type='file'
        hidden
        accept='image/*'
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0]
            setFile(f)
            setPreview(URL.createObjectURL(f))
          }
        }}
        disabled={disabled}
      />

      {preview ? (
        <img src={preview} alt='KYC' className='w-full h-full object-contain p-2' />
      ) : (
        <Box className='flex flex-col items-center p-4 text-center'>
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant='body2' fontWeight='bold'>
            {label}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            JPG, PNG (Max 5MB)
          </Typography>
        </Box>
      )}
    </Box>
  )

  const isReadOnly = kycData?.status === 'PENDING' || kycData?.status === 'APPROVED'

  return (
    // Dùng Box làm wrapper ngoài cùng (thay Grid container)
    <Box className='w-full'>
      <Card>
        <CardHeader
          title='Xác minh danh tính (KYC)'
          action={
            kycData?.status && (
              <Chip
                label={
                  kycData.status === 'APPROVED' ? 'ĐÃ DUYỆT' : kycData.status === 'PENDING' ? 'ĐANG CHỜ' : 'BỊ TỪ CHỐI'
                }
                color={kycData.status === 'APPROVED' ? 'success' : kycData.status === 'PENDING' ? 'warning' : 'error'}
                variant='filled'
                sx={{ fontWeight: 'bold' }}
              />
            )
          }
        />
        <Divider />
        <CardContent>
          {/* PHẦN ALERT (Giữ nguyên) */}
          {kycData?.status === 'PENDING' && (
            <Alert severity='warning' icon={<PendingIcon />} sx={{ mb: 3 }}>
              Hồ sơ đang được đội ngũ Admin xét duyệt. Quá trình này thường mất 24h.
            </Alert>
          )}
          {kycData?.status === 'REJECTED' && (
            <Alert severity='error' icon={<ErrorIcon />} sx={{ mb: 3 }}>
              Hồ sơ bị từ chối: <strong>{kycData.note}</strong>. Vui lòng cập nhật lại thông tin bên dưới.
            </Alert>
          )}
          {kycData?.status === 'APPROVED' && (
            <Alert severity='success' icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
              Tài khoản của bạn đã được xác minh chính chủ.
            </Alert>
          )}

          {/* FORM: Thay Grid bằng Stack */}
          <form>
            <Stack spacing={4}>
              {' '}
              {/* Spacing=4 tương đương gap 32px */}
              {/* Hàng 1: Họ tên + Số CMND */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                <TextField
                  fullWidth
                  label='Họ và tên thật'
                  value={fullName}
                  onChange={e => setFullName(e.target.value.toUpperCase())}
                  disabled={isReadOnly}
                  helperText='Phải trùng khớp với tên trên giấy tờ'
                />
                <TextField
                  fullWidth
                  label='Số CCCD / CMND'
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  disabled={isReadOnly}
                />
              </Stack>
              {/* Hàng 2: Tiêu đề ảnh */}
              <Typography variant='subtitle1' fontWeight={600}>
                Hình ảnh giấy tờ (2 mặt)
              </Typography>
              {/* Hàng 3: Hai ô upload */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                <Box flex={1}>
                  <UploadBox
                    label='Mặt trước (Có ảnh chân dung)'
                    preview={frontPreview}
                    setPreview={setFrontPreview}
                    setFile={setFrontFile}
                    disabled={isReadOnly}
                  />
                </Box>
                <Box flex={1}>
                  <UploadBox
                    label='Mặt sau (Có ngày cấp)'
                    preview={backPreview}
                    setPreview={setBackPreview}
                    setFile={setBackFile}
                    disabled={isReadOnly}
                  />
                </Box>
              </Stack>
              {/* Nút Gửi */}
              {!isReadOnly && (
                <Box>
                  <Button
                    variant='contained'
                    size='large'
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} color='inherit' />}
                  >
                    {loading ? 'Đang xử lý ảnh...' : 'Gửi hồ sơ'}
                  </Button>
                </Box>
              )}
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default KYCTab
