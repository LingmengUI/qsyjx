import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { pool } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { RowDataPacket, FieldPacket } from 'mysql2'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

interface User extends RowDataPacket {
  id: number
  email: string
  password: string
  name: string | null
  avatar: string | null
  role: 'admin' | 'user'
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // 查询用户
    const [users] = (await pool.query<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as unknown) as [User[], FieldPacket[]]

    const user = users[0]

    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json({
        success: false,
        message: '邮箱或密码错误'
      })
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 设置 cookie
    const cookieStore = cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      domain: process.env.COOKIE_DOMAIN,
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    // 在登录成功后，获取用户的 API Token
    const [apiKeyResult] = await pool.query<RowDataPacket[]>(`
      SELECT token, plan, remaining_quota, expires_at
      FROM api_keys 
      WHERE user_id = ? AND expires_at > NOW()
      ORDER BY expires_at DESC 
      LIMIT 1
    `, [user.id]) as unknown as [RowDataPacket[], FieldPacket[]]

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
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: '登录失败'
    }, { status: 500 })
  }
} 