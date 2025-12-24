'use client'

// React Imports
import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import FormHelperText from '@mui/material/FormHelperText'

type EditUserInfoData = {
  name?: string
  phone?: string
  address?: string
  taxId?: string
  province?: string
  ward?: string
}

type EditUserInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: EditUserInfoData
}

const EditUserInfo = ({ open, setOpen, data }: EditUserInfoProps) => {
  // 1. Khởi tạo state từ data truyền vào
  const [userData, setUserData] = useState<EditUserInfoData>(data || {})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // States cho API địa chính
  const [provinces, setProvinces] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])
  const [loadingGeo, setLoadingGeo] = useState({ p: false, w: false })

  const { update } = useSession()
  const router = useRouter()

  // 2. Đồng bộ userData khi prop data thay đổi (quan trọng để load thông tin cũ)
  useEffect(() => {
    if (data) setUserData(data)
  }, [data])

  // 3. Load danh sách Tỉnh và Xã hiện tại khi mở Dialog
  useEffect(() => {
    const initAddress = async () => {
      if (!open) return

      setLoadingGeo(prev => ({ ...prev, p: true }))

      try {
        // Load Tỉnh
        const resP = await fetch('https://provinces.open-api.vn/api/v2/')
        const allProvinces = await resP.json()

        setProvinces(allProvinces)
        setLoadingGeo(prev => ({ ...prev, p: false }))

        // Nếu người dùng đã có tỉnh sẵn, load ngay danh sách phường xã của tỉnh đó
        if (userData.province) {
          const currentProvince = allProvinces.find((p: any) => p.name === userData.province)

          if (currentProvince) {
            setLoadingGeo(prev => ({ ...prev, w: true }))
            const resW = await fetch(`https://provinces.open-api.vn/api/v2/p/${currentProvince.code}?depth=2`)
            const provinceDetail = await resW.json()

            setWards(provinceDetail.wards || [])
            setLoadingGeo(prev => ({ ...prev, w: false }))
          }
        }
      } catch (error) {
        console.error('Lỗi khởi tạo địa chỉ:', error)
      }
    }

    initAddress()
  }, [open, userData.province])

  // 4. Xử lý đổi tỉnh thủ công
  const handleProvinceChange = async (pCode: number, pName: string) => {
    setUserData({ ...userData, province: pName, ward: '' }) // Reset phường khi đổi tỉnh
    setWards([])
    setLoadingGeo(prev => ({ ...prev, w: true }))

    try {
      const res = await fetch(`https://provinces.open-api.vn/api/v2/p/${pCode}?depth=2`)
      const d = await res.json()

      setWards(d.wards || [])
    } finally {
      setLoadingGeo(prev => ({ ...prev, w: false }))
    }
  }

  // 5. Bắt lỗi người dùng
  const validate = () => {
    const newErrors: any = {}

    if (!userData.name?.trim()) newErrors.name = 'Họ tên không được để trống'

    if (!userData.phone?.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống'
    } else if (!/^\d{10}$/.test(userData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10 chữ số'
    }

    if (!userData.province) newErrors.province = 'Vui lòng chọn Tỉnh/Thành'
    if (!userData.ward) newErrors.ward = 'Vui lòng chọn Phường/Xã'

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  // 6. Gửi API update
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/pages/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const result = await res.json()

      if (res.ok) {
        await update({ user: { email: result.user.email } })
        router.refresh()
        setOpen(false)
      }
    } catch {
      console.error('Internal Server Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog fullWidth open={open} onClose={() => setOpen(false)} maxWidth='md' scroll='body'>
      <DialogTitle variant='h4' className='flex flex-col items-center sm:pbs-16'>
        Sửa thông tin người dùng
      </DialogTitle>
      <form onSubmit={handleFormSubmit}>
        <DialogContent className='sm:pli-16'>
          <IconButton onClick={() => setOpen(false)} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line' />
          </IconButton>

          <Grid container spacing={5}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Họ tên'
                value={userData.name || ''}
                error={!!errors.name}
                helperText={errors.name}
                onChange={e => setUserData({ ...userData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Địa chỉ cụ thể'
                value={userData.address || ''}
                onChange={e => setUserData({ ...userData, address: e.target.value })}
              />
            </Grid>
            {/* Tỉnh/Thành */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.province}>
                <InputLabel>Tỉnh/Thành phố</InputLabel>
                <Select
                  label='Tỉnh/Thành phố'
                  value={provinces.find(p => p.name === userData.province)?.code || ''}
                  onChange={e => {
                    const p = provinces.find(x => x.code === e.target.value)

                    if (p) handleProvinceChange(p.code, p.name)
                  }}
                >
                  {provinces.map(p => (
                    <MenuItem key={p.code} value={p.code}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.province && <FormHelperText>{errors.province}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Phường/Xã */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.ward} disabled={!wards.length}>
                <InputLabel>Phường/Xã</InputLabel>
                <Select
                  label='Phường/Xã'
                  value={wards.find(w => w.name === userData.ward)?.code || ''}
                  onChange={e => {
                    const w = wards.find(x => x.code === e.target.value)

                    if (w) setUserData({ ...userData, ward: w.name })
                  }}
                  endAdornment={loadingGeo.w ? <CircularProgress size={20} sx={{ mr: 8 }} /> : null}
                >
                  {wards.map(w => (
                    <MenuItem key={w.code} value={w.code}>
                      {w.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.ward && <FormHelperText>{errors.ward}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Điện thoại'
                value={userData.phone || ''}
                error={!!errors.phone}
                helperText={errors.phone}
                onChange={e => setUserData({ ...userData, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Mã số thuế'
                value={userData.taxId || ''}
                onChange={e => setUserData({ ...userData, taxId: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center sm:pbe-16'>
          <Button variant='contained' type='submit' disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Cập nhật'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={() => setOpen(false)}>
            Hủy
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditUserInfo
