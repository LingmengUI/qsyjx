import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import type { ResultSetHeader, FieldPacket } from 'mysql2'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未登录'
      }, { status: 401 })
    }

    // 验证管理员权限
    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      role: string
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: '无权限执行此操作'
      }, { status: 403 })
    }

    const { days } = await request.json()
    const { id } = context.params

    // 添加日志以便调试
    console.log('Renewing API key:', {
      id: id,
      days: days
    })

    // 更新密钥过期时间
    await (pool.query(`
      UPDATE api_keys 
      SET expires_at = DATE_ADD(
        GREATEST(expires_at, NOW()),
        INTERVAL ? DAY
      )
      WHERE id = ?
    `, [days, id]) as unknown as Promise<[ResultSetHeader, FieldPacket[]]>)

    // 获取更新后的过期时间
    const [rows] = await (pool.query(`
      SELECT expires_at FROM api_keys WHERE id = ?
    `, [id]) as unknown as Promise<[{ expires_at: string }[], FieldPacket[]]>)

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('Failed to get updated expiry date')
    }

    return NextResponse.json({
      success: true,
      message: '续期成功',
      newExpiryDate: rows[0].expires_at
    })

  } catch (error) {
    console.error('Renew API key error:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : '续期失败'
    }, { status: 500 })
  }
} 