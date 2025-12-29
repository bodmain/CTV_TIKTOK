// 'use server'

// import { prisma } from '@/libs/prisma'
// import { auth } from '@/libs/auth'
// import { revalidatePath } from 'next/cache'

// // 1. Lấy danh sách đơn hàng
// export async function getOrders() {
//   const session = await auth()

//   // Nếu chưa đăng nhập thì trả về mảng rỗng
//   if (!session?.user?.email) return []

//   // Lấy đơn hàng của user đó, sắp xếp mới nhất lên đầu
//   return await prisma.order.findMany({
//     where: { user: { email: session.user.email } },
//     orderBy: { createdAt: 'desc' }
//   })
// }

// // 2. Tạo đơn hàng giả (để test)
// export async function createMockOrder() {
//   const session = await auth()
//   if (!session?.user?.email) return { error: 'Unauthorized' }

//   const randomId = Math.floor(Math.random() * 9999)

//   await prisma.order.create({
//     data: {
//       code: `ORD-${randomId}`,
//       serviceName: 'Tăng Follow TikTok',
//       link: 'https://tiktok.com/@user_test',
//       quantity: 1000,
//       price: 50000,
//       status: 'RUNNING',
//       user: { connect: { email: session.user.email } }
//     }
//   })

//   // Làm mới trang /orders để hiện đơn vừa tạo
//   revalidatePath('/orders')
//   return { success: true }
// }
