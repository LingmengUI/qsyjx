import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { generateVerifyCode, sendVerifyCode } from '@/lib/email'
import type { RowDataPacket, FieldPacket } from 'mysql2'

interface ExistingUser extends RowDataPacket {
  id: number
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // 验证是否是 QQ 邮箱
    if (!email.endsWith('@qq.com')) {
      return NextResponse.json({
        success: false,
        message: '只支持 QQ 邮箱注册'
      })
    }

    try {
      // 检查邮箱是否已被注册
      const [existing] = (await pool.query<ExistingUser[]>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      ) as unknown) as [ExistingUser[], FieldPacket[]]

      if (existing && existing.length > 0) {
        return NextResponse.json({
          success: false,
          message: '该邮箱已被注册'
        }, { status: 400 })
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        success: false,
        message: '系统错误，请稍后重试'
      }, { status: 500 })
    }

    const code = generateVerifyCode()
    
    try {
      // 1. 先清理该邮箱的旧验证码
      await pool.query(
        'DELETE FROM verify_codes WHERE email = ?',
        [email]
      )

      // 2. 插入新的验证码，确保设置正确的过期时间
      await pool.query(
        `INSERT INTO verify_codes (email, code, expires_at) 
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
        [email, code]
      )

      // 3. 发送验证码邮件
      await sendVerifyCode(email, code)

      return NextResponse.json({
        success: true,
        message: '验证码已发送'
      })

    } catch (error) {
      console.error('Database or email error:', error)
      return NextResponse.json({
        success: false,
        message: '验证码发送失败，请稍后重试'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json({
      success: false,
      message: '请求格式错误'
    }, { status: 400 })
  }
} 