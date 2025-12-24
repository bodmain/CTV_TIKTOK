import { prisma } from '@/libs/prisma'

export const ensurePrefix = (str: string, prefix: string) => (str.startsWith(prefix) ? str : `${prefix}${str}`)
export const withoutSuffix = (str: string, suffix: string) =>
  str.endsWith(suffix) ? str.slice(0, -suffix.length) : str
export const withoutPrefix = (str: string, prefix: string) => (str.startsWith(prefix) ? str.slice(prefix.length) : str)

// 1. Định nghĩa các hằng số Key để dùng chung cho cả Project
export const SYSTEM_CONFIG_KEYS = {
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  SITE_TITLE: 'SITE_TITLE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  DEFAULT_LANGUAGE: 'DEFAULT_LANGUAGE',
  SITE_NAME: 'SITE_NAME',
  COMPANY_ADDRESS: 'COMPANY_ADDRESS',
  COMPANY_HOTLINE: 'COMPANY_HOTLINE'
} as const

let cachedSettings: Record<string, any> | null = null
let lastFetchTime = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 tiếng (tính bằng ms)

/**
 * Hàm xóa cache (Cần gọi hàm này trong API POST khi Admin cập nhật setting)
 */
export const clearSettingsCache = () => {
  cachedSettings = null
  lastFetchTime = 0
}

type ConfigKey = keyof typeof SYSTEM_CONFIG_KEYS

/**
 * Hàm lấy toàn bộ cấu hình từ DB (Có sử dụng Cache)
 */
export async function getAllSystemSettings(): Promise<Record<string, any>> {
  const now = Date.now()

  // Kiểm tra nếu cache còn hiệu lực
  if (cachedSettings && now - lastFetchTime < CACHE_TTL) {
    return cachedSettings
  }

  try {
    const configs = await prisma.systemConfig.findMany()

    const configObject = configs.reduce(
      (acc, item) => {
        let val: any = item.value

        if (val === 'true') val = true
        if (val === 'false') val = false
        acc[item.key] = val

        return acc
      },
      {} as Record<string, any>
    )

    // QUAN TRỌNG: Cập nhật lại biến Cache sau khi lấy từ DB
    cachedSettings = configObject
    lastFetchTime = now

    return configObject
  } catch (error) {
    console.error('Lỗi khi lấy danh sách settings:', error)

    return cachedSettings || {}
  }
}

/**
 * Hàm lấy cấu hình linh hoạt theo Key.
 * Đã sửa để tận dụng hàm getAllSystemSettings (có cache)
 */
export async function getSetting(key: ConfigKey, defaultValue: any = null) {
  const settings = await getAllSystemSettings()

  return settings[key] !== undefined ? settings[key] : defaultValue
}

/**
 * Hàm kiểm tra nhanh trạng thái xác thực email
 */
export async function isVerifyEmailEnabled(): Promise<boolean> {
  const value = await getSetting('VERIFY_EMAIL')

  return value === true
}
