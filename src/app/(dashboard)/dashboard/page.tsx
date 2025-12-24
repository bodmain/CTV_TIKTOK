import type { Metadata } from 'next'

import { getSetting } from '@/utils/string'

const SiteName = await getSetting('SITE_NAME')

export const metadata: Metadata = {
  title: `Dashboard | ${SiteName}`,
  description: 'dashboard'
}

export default function Page() {
  return <h1>Home page!</h1>
}
