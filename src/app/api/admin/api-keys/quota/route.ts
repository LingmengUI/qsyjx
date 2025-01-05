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

    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      role: string
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: '无权限执行此操作'
      }, { status: 403 })
    }

    const { id, quota } = await request.json()

    if (!id || !quota || quota <= 0) {
      return NextResponse.json({
        success: false,
        message: '参数错误'
      }, { status: 400 })
    }

    const result = await pool.query<ResultSetHeader>(
      `UPDATE api_keys 
       SET 
         remaining_quota = remaining_quota + ?,
         total_quota = total_quota + ?
       WHERE id = ?`,
      [quota, quota, id]
    ) as unknown as [ResultSetHeader, FieldPacket[]]

    const [updateResult] = result

    if (updateResult.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: '密钥不存在'
      }, { status: 404 })
    }

    const keyResult = await pool.query(
      'SELECT * FROM api_keys WHERE id = ?',
      [id]
    ) as unknown as [ApiKey[], FieldPacket[]]

    const [keys] = keyResult

    await deleteCache('admin:api-keys')

    return NextResponse.json({
      success: true,
      message: '增加配额成功',
      apiKey: keys[0]
    })

  } catch (error) {
    console.error('Add quota error:', error)
    return NextResponse.json({
      success: false,
      message: '增加配额失败'
    }, { status: 500 })
  }
} 