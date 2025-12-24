// Next Imports
import type { Metadata } from 'next'

import { getSetting } from '@/utils/string'

// Component Imports
import Login from '@/views/auth/Login'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const SiteName = await getSetting('SITE_NAME')

export const metadata: Metadata = {
  title: `Đăng nhập | ${SiteName}`,
  description: 'Đăng nhập vào tài khoản'
}

const LoginPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <Login mode={mode} />
}

export default LoginPage
