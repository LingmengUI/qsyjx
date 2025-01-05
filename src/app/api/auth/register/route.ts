import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { pool } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { RowDataPacket, FieldPacket, ResultSetHeader } from 'mysql2'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

interface User extends RowDataPacket {
  id: number
  email: string
  name: string | null
  avatar: string | null
  role: 'admin' | 'user'
}

interface VerifyCode extends RowDataPacket {
  code: string
  expires_at: Date
}

export async function POST(request: Request) {
  try {
    const { email, password, name, code } = await request.json()

    // 添加输入验证
    if (!email || !password || !name || !code) {
      return NextResponse.json({
        success: false,
        message: '请填写所有必填字段',
        missingFields: {
          email: !email,
          password: !password,
          name: !name,
          code: !code
        }
      }, { status: 400 })
    }

    // 验证邮箱格式
    if (!email.includes('@')) {
      return NextResponse.json({
        success: false,
        message: '请输入有效的邮箱地址'
      }, { status: 400 })
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: '密码长度至少为6位'
      }, { status: 400 })
    }

    // 验证验证码
    const [codes] = (await pool.query<VerifyCode[]>(
      'SELECT code, expires_at FROM verify_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    ) as unknown) as [VerifyCode[], FieldPacket[]]

    const storedCode = codes[0]

    if (!storedCode) {
      return NextResponse.json({
        success: false,
        message: '验证码已过期，请重新获取'
      })
    }

    if (storedCode.code !== code) {
      return NextResponse.json({
        success: false,
        message: '验证码错误'
      })
    }

    if (new Date() > storedCode.expires_at) {
      // 删除过期的验证码
      await pool.query(
        'DELETE FROM verify_codes WHERE email = ?',
        [email]
      )
      return NextResponse.json({
        success: false,
        message: '验证码已过期，请重新获取'
      })
    }

    // 检查邮箱是否已被注册
    const [existingUsers] = (await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as unknown) as [User[], FieldPacket[]]

    if (existingUsers.length > 0) {
      return NextResponse.json({
        success: false,
        message: '该邮箱已被注册'
      })
    }

    // 检查是否是第一个用户
    const [userCount] = (await pool.query(
      'SELECT COUNT(*) as count FROM users'
    ) as unknown) as [{ count: number }[], FieldPacket[]]

    // 第一个注册的用户设置为管理员
    const role = userCount[0].count === 0 ? 'admin' : 'user'

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const [result] = (await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name || null, role]
    ) as unknown) as [ResultSetHeader, FieldPacket[]]

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: result.insertId,
        email,
        role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 注册成功后删除验证码
    await pool.query(
      'DELETE FROM verify_codes WHERE email = ?',
      [email]
    )

    // 设置 cookie
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.insertId,
        email,
        name: name || null,
        avatar: null,
        role
      }
    })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({
      success: false,
      message: '注册失败'
    }, { status: 500 })
  }
} 