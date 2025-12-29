// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import EditUserInfo from '@components/dialogs/edit-user-info'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

// Import Component Avatar
import UserAvatar from './UserAvatar'

// !!! QUAN TRỌNG: Import Prisma và Auth
import { auth } from '@/libs/auth'
import { prisma } from '@/libs/prisma' // <--- Thêm dòng này

const UserDetails = async () => {
  const session = await auth()

  // !!! QUAN TRỌNG: Lấy dữ liệu user mới nhất từ Database thay vì session
  // Session chỉ dùng để lấy email định danh
  const data = await prisma.user.findUnique({
    where: { email: session?.user?.email as string }
  })

  // Nếu không tìm thấy user (trường hợp hiếm), dùng tạm dữ liệu session hoặc null
  if (!data) return null

  // Vars
  const buttonProps = (children: string, color: ThemeColor, variant: ButtonProps['variant']): ButtonProps => ({
    children,
    color,
    variant
  })

  // Map trạng thái
  const statusMap: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'Kích hoạt', color: 'success.main' },
    LOCKED: { label: 'Đã khóa', color: 'error.main' },
    SUSPENDED: { label: 'Đình chỉ', color: 'warning.main' }
  }

  return (
    <>
      <Card>
        <CardContent className='flex flex-col pbs-12 gap-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col items-center justify-center gap-4'>
              {/* Component Avatar */}
              <UserAvatar avatarUrl={data?.image || '/images/avatars/1.png'} userName={data?.name || 'User'} />

              <Typography variant='h5'>{data?.name}</Typography>
            </div>
          </div>

          <div>
            <Typography variant='h5'>Chi tiết tài khoản</Typography>
            <Divider className='mlb-4' />
            <div className='flex flex-col gap-2'>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography color='text.primary' className='font-medium'>
                  Họ tên:
                </Typography>
                <Typography>{data?.name}</Typography>
              </div>

              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography color='text.primary' className='font-medium'>
                  Điện thoại:
                </Typography>
                <Typography>{data?.phone || 'Chưa cập nhật'}</Typography>
              </div>

              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography color='text.primary' className='font-medium'>
                  Email:
                </Typography>
                <Typography>{data?.email}</Typography>
              </div>

              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography color='text.primary' className='font-medium'>
                  Mã số thuế:
                </Typography>
                <Typography>{data?.tax || 'Chưa cập nhật'}</Typography>
              </div>

              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography color='text.primary' className='font-medium'>
                  Tình trạng:
                </Typography>
                <Typography color={statusMap[data?.status || '']?.color || 'text.secondary'}>
                  {statusMap[data?.status || '']?.label || 'Chưa kiểm duyệt'}
                </Typography>
              </div>

              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography color='text.primary' className='font-medium'>
                  Địa chỉ:
                </Typography>
                <Typography>
                  {data?.address}
                  {(data?.ward || data?.province) && `, ${data?.ward}, ${data?.province}`}
                  {!data?.address && !data?.ward && !data?.province && 'Chưa cập nhật'}
                </Typography>
              </div>
            </div>
          </div>

          <div className='flex gap-4 justify-center'>
            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps('Sửa thông tin', 'primary', 'contained')}
              dialog={EditUserInfo}
              dialogProps={{
                // Truyền data mới nhất vào form sửa
                data: {
                  name: data?.name,
                  phone: data?.phone,
                  address: data?.address,
                  taxId: data?.tax,
                  province: data?.province,
                  ward: data?.ward
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default UserDetails
