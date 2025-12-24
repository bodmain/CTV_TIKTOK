// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ResetPassword from '@/views/auth/ResetPassword'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Đặt lại mật khất',
  description: 'Đặt lại mật khất tài khoản'
}

const ResetPasswordPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <ResetPassword mode={mode} />
}

export default ResetPasswordPage
