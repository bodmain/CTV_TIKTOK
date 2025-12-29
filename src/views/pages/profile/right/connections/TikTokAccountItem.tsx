// src/views/pages/profile/connections/TikTokAccountItem.tsx
'use client'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { styled, keyframes, useTheme } from '@mui/material/styles'

// !!! THÊM: Import Icon thùng rác chuẩn của MUI
import DeleteIcon from '@mui/icons-material/DeleteOutline'

// --- STYLES (Giữ nguyên) ---
const ripple = keyframes`
  0% { transform: scale(.8); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
`
const LiveAvatarBadge = styled(Box)(() => ({
  position: 'relative',
  display: 'inline-block',
  '&::after': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '3px solid #ff0050',
    content: '""',
    animation: `${ripple} 1.2s infinite cubic-bezier(0, 0, 0.2, 1)`,
    boxSizing: 'border-box',
    zIndex: 0
  }
}))
const StatusDot = styled('span')<{ color: string }>(({ color }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  display: 'inline-block',
  backgroundColor: color,
  marginRight: 6
}))

type Props = {
  account: any
  onDeleteRequest: (id: string) => void
}

const TikTokAccountItem = ({ account, onDeleteRequest }: Props) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: 'action.hover' }
      }}
    >
      {/* 1. INFO */}
      <Box className='flex items-center gap-4 w-full sm:flex-1'>
        {account.isLive ? (
          <LiveAvatarBadge>
            <Avatar
              src={account.avatar}
              alt={account.username}
              sx={{ width: 48, height: 48, border: '2px solid #ff0050', position: 'relative', zIndex: 1 }}
            />
          </LiveAvatarBadge>
        ) : (
          <Avatar src={account.avatar} alt={account.username} sx={{ width: 48, height: 48 }} />
        )}
        <Box>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.primary' }}>
            {account.nickname || account.username}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {account.username} • {account.followers || 'Chưa cập nhật'}
          </Typography>
        </Box>
      </Box>

      {/* 2. STATE */}
      <Box className='w-full sm:w-40 flex items-center justify-between sm:justify-start mt-2 sm:mt-0'>
        <Typography variant='body2' className='sm:hidden font-bold' color='text.secondary'>
          Trạng thái:
        </Typography>
        {account.isLive ? (
          <Chip
            label='Đang Live'
            size='small'
            sx={{ bgcolor: 'rgba(255, 0, 80, 0.1)', color: '#ff0050', fontWeight: 'bold', border: '1px solid #ff0050' }}
            icon={<StatusDot color='#ff0050' />}
          />
        ) : (
          <Chip
            label='Offline'
            size='small'
            variant='outlined'
            sx={{ color: 'text.disabled', borderColor: 'text.disabled' }}
            icon={<StatusDot color='#9e9e9e' />}
          />
        )}
      </Box>

      {/* 3. ACTIONS */}
      <Box className='flex items-center gap-2 w-full sm:w-24 justify-end mt-2 sm:mt-0'>
        <Tooltip title='Xóa tài khoản'>
          <IconButton
            onClick={() => onDeleteRequest(account.id)}
            size='small'
            color='error'
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': { bgcolor: 'error.lighter', borderColor: 'error.main' }
            }}
          >
            {/* SỬA: Dùng icon DeleteOutline của MUI thay vì thẻ i */}
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default TikTokAccountItem
