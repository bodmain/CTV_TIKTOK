// Next Imports
import type { Metadata } from 'next'

import { getSetting } from '@/utils/string'

// Component Imports
import Register from '@/views/auth/Register'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const SiteName = await getSetting('SITE_NAME')

export const metadata: Metadata = {
  title: `Đăng ký | ${SiteName}`,
  description: 'Đăng ký tài khoản'
}

const RegisterPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <Register mode={mode} />
}

export default RegisterPage
