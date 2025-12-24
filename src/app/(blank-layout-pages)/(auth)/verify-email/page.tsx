// Component Imports
import type { Metadata } from 'next'

import { getSetting } from '@/utils/string'
import VerifyEmail from '@/views/auth/VerifyEmail'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const SiteName = await getSetting('SITE_NAME')

export const metadata: Metadata = {
  title: `Xác minh email | ${SiteName}`,
  description: 'Xác minh email tài khoản'
}

const VerifyEmailPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <VerifyEmail mode={mode} />
}

export default VerifyEmailPage
