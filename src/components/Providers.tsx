// Providers.tsx
import { SessionProvider } from 'next-auth/react'

import { ToastContainer } from 'react-toastify'

import type { ChildrenType, Direction } from '@core/types'
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'
import ClientProviders from '@/components/QueryProvider' // Tên mới hoặc file mới

import { getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'

type Props = ChildrenType & {
  direction: Direction
}

const Providers = async (props: Props) => {
  const { children, direction } = props
  const mode = await getMode()
  const settingsCookie = await getSettingsFromCookie()
  const systemMode = await getSystemMode()

  return (
    <SessionProvider>
      <VerticalNavProvider>
        <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
          <ThemeProvider direction={direction} systemMode={systemMode}>
            {/* Gộp tất cả các Client Logic vào đây */}
            <ClientProviders>{children}</ClientProviders>
            <ToastContainer theme={mode === 'dark' ? 'dark' : 'light'} position='bottom-right' autoClose={5000} />
          </ThemeProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </SessionProvider>
  )
}

export default Providers
