// Next Imports
import type { Metadata } from 'next'

import { getSetting } from '@/utils/string'

// Component Imports
import NewVerification from '@/views/auth/NewVerification'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const SiteName = await getSetting('SITE_NAME')

export const metadata: Metadata = {
  title: `Xác minh email | ${SiteName}`,
  description: 'Xác minh email tài khoản'
}

const NewVerificationPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <NewVerification mode={mode} />
}

export default NewVerificationPage
