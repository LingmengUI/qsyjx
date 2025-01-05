import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { pool } from '@/lib/db'
import type { RowDataPacket, FieldPacket } from 'mysql2'

interface User extends RowDataPacket {
  id: number
  email: string
  role: 'admin' | 'user'
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

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

    // 从数据库获取最新的用户信息
    const result = await pool.query<User[]>(
      'SELECT email, role FROM users WHERE id = ?',
      [decoded.userId]
    )
    const [users] = result as unknown as [User[], FieldPacket[]]

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 })
    }

    const user = users[0]

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({
      success: false,
      message: '获取用户信息失败'
    }, { status: 500 })
  }
} 