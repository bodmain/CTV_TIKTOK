import nodemailer from 'nodemailer'

import { getAllSystemSettings } from '@/utils/string'

export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  })

  const settings = await getAllSystemSettings()

  const siteName = settings['SITE_NAME'] || 'CTV Tiktok'
  const address = settings['COMPANY_ADDRESS'] || 'Địa chỉ đang cập nhật'
  const hotline = settings['COMPANY_HOTLINE'] || ''

  // Link trỏ tới trang đặt lại mật khẩu mới
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  const mailOptions = {
    from: `"${siteName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Đặt lại mật khẩu cho tài khoản ${siteName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
          <h1 style="margin: 0; font-size: 24px; color: #000;">${siteName}</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px;">Xin chào <strong>${name}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>${siteName}</strong>.</p>
          <p>Vui lòng nhấn vào nút bên dưới để tiến hành thay đổi mật khẩu mới. Nếu bạn không gửi yêu cầu này, bạn có thể bỏ qua email này một cách an toàn.</p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}"
               style="background-color: #d32f2f; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
               Đặt lại mật khẩu mới
            </a>
          </div>

          <p style="font-size: 14px; color: #666;">
            <strong>Lưu ý:</strong> Liên kết này chỉ có hiệu lực trong vòng <strong>1 giờ</strong>. Để đảm bảo an toàn, tuyệt đối không chia sẻ email này cho bất kỳ ai khác.
          </p>
          <p style="font-size: 14px; color: #666; margin-top: 10px;">
            Nếu nút trên không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt: <br/>
            <span style="color: #0066cc; word-break: break-all;">${resetLink}</span>
          </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 30px; font-size: 12px; color: #999; border-top: 1px solid #eee;">
          <p style="margin: 5px 0;">Yêu cầu được thực hiện từ hệ thống của ${siteName}.</p>
          <p style="margin: 5px 0;">Địa chỉ: ${address}</p>
          <p style="margin: 5px 0;">Email hỗ trợ: ${process.env.EMAIL_USER}</p>
          <p style="margin: 5px 0;">Hotline: ${hotline}</p>
          <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} ${siteName} Team. All rights reserved.</p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.log('Error sending password reset email:', error)
    throw new Error('Không thể gửi email đặt lại mật khẩu.')
  }
}
