// src/views/pages/profile/connections/index.tsx
'use client'

import { useState, useEffect } from 'react'

// MUI
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// Components con
import TikTokAccountItem from './TikTokAccountItem'
import AddTikTokDialog from './AddTikTokDialog'
import DeleteTikTokDialog from './DeleteTikTokDialog'

// Logic
import { getTikTokAccounts } from '@/app/server/tiktok-actions'

const ConnectionsTab = () => {
  const [accounts, setAccounts] = useState<any[]>([])

  // State quản lý Modal
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])
  const loadData = async () => {
    setAccounts(await getTikTokAccounts())
  }

  // Hàm mở modal xóa (được gọi từ Component con)
  const handleDeleteRequest = (id: string) => {
    setSelectedDeleteId(id)
    setOpenDelete(true)
  }

  return (
    <div className='w-full'>
      <Card>
        <CardHeader
          title='Tài khoản TikTok'
          subheader='Quản lý danh sách các kênh kết nối'
          action={
            <Button variant='contained' onClick={() => setOpenAdd(true)} startIcon={<i className='tabler-plus' />}>
              Thêm kênh
            </Button>
          }
        />
        <CardContent className='flex flex-col gap-0'>
          {/* Header Bảng */}
          <Box className='hidden sm:flex px-4 py-3 border-b text-xs font-bold uppercase bg-gray-50 text-gray-500'>
            <Box className='flex-1'>Kênh TikTok</Box>
            <Box className='w-40'>Trạng thái</Box>
            <Box className='w-24 text-right'>Thao tác</Box>
          </Box>

          {/* Empty State */}
          {accounts.length === 0 && (
            <Box className='p-8 text-center text-gray-400 border border-dashed rounded mt-4'>
              Chưa có dữ liệu. Hãy thêm kênh mới.
            </Box>
          )}

          {/* Danh sách Items */}
          {accounts.map(acc => (
            <TikTokAccountItem key={acc.id} account={acc} onDeleteRequest={handleDeleteRequest} />
          ))}
        </CardContent>
      </Card>

      {/* --- CÁC MODAL --- */}
      <AddTikTokDialog open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={loadData} />

      <DeleteTikTokDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        deleteId={selectedDeleteId}
        onSuccess={loadData}
      />
    </div>
  )
}

export default ConnectionsTab
