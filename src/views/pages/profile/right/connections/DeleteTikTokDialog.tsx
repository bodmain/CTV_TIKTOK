// src/views/pages/profile/connections/DeleteTikTokDialog.tsx
'use client'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { toast } from 'react-toastify'
import { deleteTikTokAccount } from '@/app/server/tiktok-actions'

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU (Props) ---
type Props = {
  open: boolean
  onClose: () => void
  deleteId: string | null // <--- Quan trọng: Phải khai báo dòng này
  onSuccess: () => void
}

const DeleteTikTokDialog = ({ open, onClose, deleteId, onSuccess }: Props) => {
  const handleDelete = async () => {
    if (!deleteId) return

    await deleteTikTokAccount(deleteId)
    toast.success('Đã xóa kênh khỏi hệ thống')
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Xác nhận xóa?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Hành động này sẽ xóa kênh khỏi danh sách theo dõi của bạn. Bạn có chắc chắn không?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleDelete} variant='contained' color='error'>
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteTikTokDialog
