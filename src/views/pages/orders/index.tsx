// // src/views/pages/orders/index.tsx
// 'use client'

// import { useState, useEffect } from 'react'

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardHeader from '@mui/material/CardHeader'
// import Stack from '@mui/material/Stack'
// import Table from '@mui/material/Table'
// import TableHead from '@mui/material/TableHead'
// import TableRow from '@mui/material/TableRow'
// import TableBody from '@mui/material/TableBody'
// import TableCell from '@mui/material/TableCell'
// import TableContainer from '@mui/material/TableContainer'
// import Chip from '@mui/material/Chip'
// import Button from '@mui/material/Button'
// import Typography from '@mui/material/Typography'
// import CircularProgress from '@mui/material/CircularProgress'
// import Box from '@mui/material/Box'

// // Icons
// import RefreshIcon from '@mui/icons-material/Refresh'
// import AddCircleIcon from '@mui/icons-material/AddCircle'

// // Logic
// import { getOrders, createMockOrder } from '@/app/server/order-actions'
// import { toast } from 'react-toastify'

// const OrderListTable = () => {
//   const [orders, setOrders] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => { loadData() }, [])

//   const loadData = async () => {
//     setLoading(true)
//     const data = await getOrders()
//     setOrders(data)
//     setLoading(false)
//   }

//   const handleCreateMock = async () => {
//     await createMockOrder()
//     toast.success('Đã tạo 1 đơn hàng mẫu!')
//     loadData()
//   }

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'COMPLETED': return 'success'
//       case 'RUNNING': return 'info'
//       case 'CANCELLED': return 'error'
//       default: return 'warning'
//     }
//   }

//   const getStatusLabel = (status: string) => {
//     switch (status) {
//       case 'COMPLETED': return 'Hoàn thành'
//       case 'RUNNING': return 'Đang chạy'
//       case 'CANCELLED': return 'Đã hủy'
//       default: return 'Đang chờ'
//     }
//   }

//   return (
//     <Stack spacing={6}>
//       <Card>
//         <CardHeader
//           title='Danh sách đơn hàng'
//           subheader='Theo dõi tiến độ các đơn hàng của bạn'
//           action={
//             <Stack direction="row" spacing={2}>
//               <Button variant="outlined" startIcon={<AddCircleIcon />} onClick={handleCreateMock}>
//                 Tạo đơn test
//               </Button>
//               <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadData}>
//                 Làm mới
//               </Button>
//             </Stack>
//           }
//         />

//         <TableContainer>
//           <Table sx={{ minWidth: 800 }}>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Mã đơn</TableCell>
//                 <TableCell>Dịch vụ</TableCell>
//                 <TableCell>Link TikTok</TableCell>
//                 <TableCell>Số lượng</TableCell>
//                 <TableCell>Thành tiền</TableCell>
//                 <TableCell>Trạng thái</TableCell>
//                 <TableCell>Ngày tạo</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
//                     <CircularProgress />
//                   </TableCell>
//                 </TableRow>
//               ) : orders.length > 0 ? (
//                 orders.map((row) => (
//                   <TableRow key={row.id} hover>
//                     <TableCell>
//                       <Typography fontWeight="bold" color="primary">{row.code}</Typography>
//                     </TableCell>
//                     <TableCell>{row.serviceName}</TableCell>
//                     <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                       <a href={row.link} target="_blank" className="text-blue-500 hover:underline">
//                         {row.link}
//                       </a>
//                     </TableCell>
//                     <TableCell>{row.quantity.toLocaleString()}</TableCell>
//                     <TableCell>{row.price.toLocaleString()} đ</TableCell>
//                     <TableCell>
//                       <Chip
//                         label={getStatusLabel(row.status)}
//                         color={getStatusColor(row.status) as any}
//                         size="small"
//                         variant="outlined"
//                         sx={{ fontWeight: 'bold' }}
//                       />
//                     </TableCell>
//                     <TableCell>{new Date(row.createdAt).toLocaleDateString('vi-VN')}</TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
//                     <Box className="flex flex-col items-center">
//                       <Typography variant="body1" color="text.secondary">Chưa có đơn hàng nào.</Typography>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Card>
//     </Stack>
//   )
// }

// export default OrderListTable
