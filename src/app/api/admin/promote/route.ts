import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

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

    // 验证 token 并检查是否为管理员
    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      userId: number
      email: string
      role: string
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: '无权限执行此操作'
      }, { status: 403 })
    }

    const { email } = await request.json()

    // 更新用户角色为管理员
    await pool.query(
      'UPDATE users SET role = ? WHERE email = ?',
      ['admin', email]
    )

    return NextResponse.json({
      success: true,
      message: '已成功设置为管理员'
    })

  } catch (error) {
    console.error('Promote error:', error)
    return NextResponse.json({
      success: false,
      message: '操作失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 