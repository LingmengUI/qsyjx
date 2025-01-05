import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
  tls: {
    rejectUnauthorized: false
  }
})

export function generateVerifyCode(length = 6) {
  return Math.random().toString().slice(2, 2 + length)
}

export async function sendVerifyCode(to: string, code: string) {
  const maxRetries = 3
  let retryCount = 0

  const tryToSend = async (): Promise<boolean> => {
    try {
      await transporter.verify()
      
      const info = await transporter.sendMail({
        from: `"视频解析" <${process.env.EMAIL_USER}>`,
        to,
        subject: '验证码',
        text: `您的验证码是：${code}，5分钟内有效。`,
        html: `
          <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
            <h2 style="color: #333; margin-bottom: 20px;">视频解析 - 验证码</h2>
            <p style="color: #666; margin-bottom: 10px;">您好，</p>
            <p style="color: #666; margin-bottom: 20px;">您的验证码是：</p>
            <div style="background-color: #fff; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
              <span style="font-size: 24px; font-weight: bold; color: #007bff;">${code}</span>
            </div>
            <p style="color: #666; margin-bottom: 10px;">验证码有效期为5分钟。</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">此邮件由系统自动发送，请勿回复。</p>
          </div>
        `
      })

      console.log('Verification code sent:', info.messageId)
      return true

    } catch (error) {
      console.error(`Send email attempt ${retryCount + 1} failed:`, error)
      
      if (retryCount < maxRetries) {
        retryCount++
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        return tryToSend()
      }
      
      throw error
    }
  }

  return tryToSend()
} 