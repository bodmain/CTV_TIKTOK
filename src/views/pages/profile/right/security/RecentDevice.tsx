'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import 'react-toastify/dist/ReactToastify.css'

// Định nghĩa kiểu dữ liệu cho thiết bị
interface DeviceLog {
  browser: string
  os: string
  deviceType: string
  location: string
  loginTime: Date
}

const RecentDevice = () => {
  // 1. Tạo state để lưu trữ danh sách thiết bị
  const [recentDeviceData, setRecentDeviceData] = useState<DeviceLog[]>([])

  // 2. Lấy dữ liệu login log và cập nhật vào state
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await fetch('/api/pages/profile/recent-device') // Đảm bảo đúng endpoint API của bạn

        if (!res.ok) throw new Error('Network response was not ok')

        const data = await res.json()

        setRecentDeviceData(data) // Cập nhật dữ liệu vào state để hiển thị
      } catch {
        console.error('Internal Server Error')
      }
    }

    fetchConfigs()
  }, [])

  // Hàm định dạng ngày tháng tiếng Việt: 15:30, 20/12/2025
  const formatVietnameseDate = (date: Date) => {
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader title='Truy cập gần đây' />
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Trình duyệt</th>
              <th>Thiết bị</th>
              <th>vị trí</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {recentDeviceData.length > 0 ? (
              recentDeviceData.map((device, index) => (
                <tr key={index}>
                  <td>
                    <div className='flex items-center gap-4'>
                      {/* Tự động đổi icon dựa trên trình duyệt */}
                      <img
                        alt={device.browser}
                        width='22px'
                        src={`/images/logos/${device.browser.toLowerCase().includes('chrome') ? 'chrome.png' : 'safari.png'}`}
                      />
                      <Typography color='text.primary' className='font-medium'>
                        {device.browser}
                      </Typography>
                    </div>
                  </td>
                  <td>
                    <Typography>{device.deviceType}</Typography>
                  </td>
                  <td>
                    <Typography>{device.location}</Typography>
                  </td>
                  <td>
                    <Typography color='text.secondary'>{formatVietnameseDate(device.loginTime)}</Typography>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className='text-center p-4'>
                  <Typography>Không có dữ liệu truy cập gần đây</Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default RecentDevice
