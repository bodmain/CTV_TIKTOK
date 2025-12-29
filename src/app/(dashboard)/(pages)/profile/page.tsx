// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import type { Metadata } from 'next'

import UserLeftOverview from '@views/pages/profile/left-overview'
import UserRight from '@views/pages/profile/right'

import { getSetting } from '@/utils/string'

const SiteName = await getSetting('SITE_NAME')

export const metadata: Metadata = {
  title: `Tài khoản | ${SiteName}`,
  description: 'Tài khoản của tôi'
}

// Import các Tab cũ (Dùng dynamic import để tải trang nhanh hơn)
const SecurityTab = dynamic(() => import('@views/pages/profile/right/security'))
const NotificationsTab = dynamic(() => import('@views/pages/profile/right/notifications'))
const ConnectionsTab = dynamic(() => import('@views/pages/profile/right/connections'))

// --- 1. THÊM DÒNG NÀY: Import Tab KYC ---
const KYCTab = dynamic(() => import('@views/pages/profile/right/kyc'))
// ----------------------------------------

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  security: <SecurityTab />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />,

  // --- 2. THÊM DÒNG NÀY: Khai báo nội dung ---
  kyc: <KYCTab />
  // Chữ 'kyc' này khớp với value='kyc' bạn đã đặt bên file UserRight
})

const UserViewTab = async () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <UserLeftOverview />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <UserRight tabContentList={tabContentList()} />
      </Grid>
    </Grid>
  )
}

export default UserViewTab
