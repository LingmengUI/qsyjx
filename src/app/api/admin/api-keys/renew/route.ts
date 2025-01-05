import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import type { ResultSetHeader, RowDataPacket, FieldPacket } from 'mysql2'
import { deleteCache } from '@/lib/redis'

interface ApiKey extends RowDataPacket {
  id: number
  token: string
  user_id: number
  plan: string
  total_quota: number
  remaining_quota: number
  expires_at: string
  created_at: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

export async function POST(request: Request) {
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

    const { id, days, quota } = await request.json()

    if (!id || !days || days <= 0) {
      return NextResponse.json({
        success: false,
        message: '参数错误'
      }, { status: 400 })
    }

    // 更新过期时间和配额
    const result = await pool.query<ResultSetHeader>(
      `UPDATE api_keys 
       SET 
         expires_at = DATE_ADD(
           GREATEST(expires_at, NOW()), 
           INTERVAL ? DAY
         ),
         remaining_quota = remaining_quota + ?,
         total_quota = total_quota + ?
       WHERE id = ?`,
      [days, quota, quota, id]
    ) as unknown as [ResultSetHeader, FieldPacket[]]

    const [updateResult] = result

    if (updateResult.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: '密钥不存在'
      }, { status: 404 })
    }

    // 获取更新后的密钥信息
    const keyResult = await pool.query(
      'SELECT * FROM api_keys WHERE id = ?',
      [id]
    ) as unknown as [ApiKey[], FieldPacket[]]

    const [keys] = keyResult

    // 清除缓存
    await deleteCache('admin:api-keys')

    return NextResponse.json({
      success: true,
      message: '续期成功',
      apiKey: keys[0]
    })

  } catch (error) {
    console.error('Renew API key error:', error)
    return NextResponse.json({
      success: false,
      message: '续期失败'
    }, { status: 500 })
  }
} 