// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import type { Metadata } from 'next'

import Settings from '@views/pages/settings'
import { getSetting } from '@/utils/string'

const SiteName = await getSetting('SITE_NAME')

export const metadata: Metadata = {
  title: `Cấu hình | ${SiteName}`,
  description: 'Cấu hình hệ thống'
}

const GlobalTab = dynamic(() => import('@/views/pages/settings/global'))
const SecurityTab = dynamic(() => import('@views/pages/settings/security'))
const CompanyTab = dynamic(() => import('@views/pages/settings/company'))
const NotificationsTab = dynamic(() => import('@views/pages/settings/notifications'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  global: <GlobalTab />,
  security: <SecurityTab />,
  company: <CompanyTab />,
  notifications: <NotificationsTab />
})

const SettingsPage = () => {
  return <Settings tabContentList={tabContentList()} />
}

export default SettingsPage
