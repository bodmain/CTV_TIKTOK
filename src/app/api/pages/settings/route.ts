// route.ts
import { NextResponse } from 'next/server'

import { prisma } from '@/libs/prisma'
import { SYSTEM_CONFIG_KEYS, clearSettingsCache } from '@/utils/string' // Import hằng số key

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const keysParam = searchParams.get('keys')

    let configs

    if (keysParam) {
      const keys = keysParam.split(',').map(k => k.trim())

      configs = await prisma.systemConfig.findMany({
        where: { key: { in: keys } }
      })
    } else {
      configs = await prisma.systemConfig.findMany()
    }

    const configObject = configs.reduce((acc: Record<string, any>, item) => {
      let val: any = item.value

      if (val === 'true') val = true
      if (val === 'false') val = false
      acc[item.key] = val

      return acc
    }, {})

    return NextResponse.json(configObject)
  } catch (error) {
    console.error('API GET Config Error:', error)

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { key, value } = await req.json()

    if (!key) {
      return NextResponse.json({ message: 'Key is required' }, { status: 400 })
    }

    // Kiểm tra xem Key có hợp lệ không (Tùy chọn nhưng nên có)
    const validKeys = Object.values(SYSTEM_CONFIG_KEYS) as string[]

    if (!validKeys.includes(key)) {
      // Bạn có thể chọn chặn lại hoặc cho phép tạo mới tùy nhu cầu
      console.warn(`Cảnh báo: Đang cập nhật key không nằm trong danh sách chuẩn: ${key}`)
    }

    const stringValue = String(value)

    const updatedConfig = await prisma.systemConfig.upsert({
      where: { key: key },
      update: {
        value: stringValue,
        updatedAt: new Date()
      },
      create: {
        key: key,
        value: stringValue,
        description: `Cấu hình cho ${key}`
      }
    })

    clearSettingsCache()

    return NextResponse.json({
      success: true,
      data: updatedConfig
    })
  } catch (error) {
    console.error('API POST Config Error:', error)

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
