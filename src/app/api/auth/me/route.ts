import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { pool } from '@/lib/db'
import jwt from 'jsonwebtoken'
import type { RowDataPacket, FieldPacket } from 'mysql2'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

interface User extends RowDataPacket {
  id: number
  email: string
  name: string | null
  avatar: string | null
  role: 'admin' | 'user'
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未登录'
      }, { status: 401 })
    }

    // 验证 token
    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      userId: number
      email: string
      role: string
    }

    // 从数据库获取用户信息
    const [users] = (await pool.query<User[]>(
      'SELECT id, email, name, avatar, role FROM users WHERE id = ?',
      [decoded.userId]
    ) as unknown) as [User[], FieldPacket[]]

    const user = users[0]

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 })
    }

    // 获取用户信息时同时返回 API Token 信息
    const [apiKeyResult] = await pool.query<RowDataPacket[]>(`
      SELECT token, plan, remaining_quota, expires_at
      FROM api_keys 
      WHERE user_id = ? AND expires_at > NOW()
      ORDER BY expires_at DESC 
      LIMIT 1
    `, [decoded.userId]) as unknown as [RowDataPacket[], FieldPacket[]]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        avatar: user.avatar || '',
        role: user.role
      },
      apiKey: apiKeyResult[0] ? {
        token: apiKeyResult[0].token,
        plan: apiKeyResult[0].plan,
        remainingCalls: apiKeyResult[0].remaining_quota,
        expiresAt: apiKeyResult[0].expires_at
      } : null
    })

  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json({
      success: false,
      message: '获取用户信息失败'
    }, { status: 500 })
  }
} 