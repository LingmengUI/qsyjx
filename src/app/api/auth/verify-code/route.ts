import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import type { RowDataPacket, FieldPacket } from 'mysql2'

interface VerifyCode extends RowDataPacket {
  code: string
  expires_at: Date
}

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    // 1. 清理过期的验证码
    await pool.query(
      'DELETE FROM verify_codes WHERE expires_at < NOW()'
    )

    // 2. 获取最新的有效验证码
    const result = await pool.query<VerifyCode[]>(
      `SELECT code, expires_at 
       FROM verify_codes 
       WHERE email = ? 
       AND expires_at > NOW() 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email]
    )
    const [codes] = result as unknown as [VerifyCode[], FieldPacket[]]

    if (!codes || codes.length === 0) {
      return NextResponse.json({
        success: false,
        message: '验证码已过期或不存在'
      }, { status: 400 })
    }

    const verifyCode = codes[0]

    // 3. 验证码匹配检查
    if (code !== verifyCode.code) {
      return NextResponse.json({
        success: false,
        message: '验证码错误'
      }, { status: 400 })
    }

    // 4. 验证成功后立即删除已使用的验证码
    await pool.query(
      'DELETE FROM verify_codes WHERE email = ?',
      [email]
    )

    return NextResponse.json({
      success: true,
      message: '验证成功'
    })

  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json({
      success: false,
      message: '验证失败'
    }, { status: 500 })
  }
} 