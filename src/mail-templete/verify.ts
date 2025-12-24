import nodemailer from 'nodemailer'

import { getAllSystemSettings } from '@/utils/string'

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
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
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/new-verification?token=${token}`

  const mailOptions = {
    from: `"${siteName}" <${process.env.EMAIL_USER}>`, // Tên hệ thống động
    to: email,
    subject: `Xác thực tài khoản tại ${siteName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
          <h1 style="margin: 0; font-size: 24px; color: #000;">CTV Tiktok</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px;">Xin chào <strong>${name}</strong>,</p>
          <p>Chào mừng bạn đến với cộng đồng <strong>${siteName}</strong>. Chúng tôi đã nhận được yêu cầu đăng ký tài khoản của bạn.</p>
          <p>Để đảm bảo tính bảo mật và hoàn tất quy trình thiết lập tài khoản, vui lòng xác nhận địa chỉ email này bằng cách nhấn vào nút dưới đây:</p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${confirmLink}"
               style="background-color: #000; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
               Xác nhận địa chỉ Email
            </a>
          </div>

          <p style="font-size: 14px; color: #666;">
            <strong>Lưu ý:</strong> Liên kết xác nhận này sẽ hết hạn trong vòng 24 giờ. Nếu bạn không thực hiện yêu cầu này, bạn có thể yên tâm bỏ qua email này, tài khoản sẽ không được kích hoạt.
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
    console.log('Error sending email:', error)
    throw new Error('Không thể gửi email xác thực.')
  }
}
