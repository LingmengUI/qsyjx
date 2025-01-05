import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com' // 在 .env 中配置超级管理员邮箱

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

    // 验证 token 并检查是否为超级管理员
    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      userId: number
      email: string
      role: string
    }

    // 只允许超级管理员执行此操作
    if (decoded.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({
        success: false,
        message: '只有超级管理员可以执行此操作'
      }, { status: 403 })
    }

    const { email } = await request.json()

    // 不允许撤销超级管理员的权限
    if (email === SUPER_ADMIN_EMAIL) {
      return NextResponse.json({
        success: false,
        message: '不能撤销超级管理员的权限'
      }, { status: 403 })
    }

    // 更新用户角色为普通用户
    await pool.query(
      'UPDATE users SET role = ? WHERE email = ? AND email != ?',
      ['user', email, SUPER_ADMIN_EMAIL]
    )

    return NextResponse.json({
      success: true,
      message: '已成功撤销管理员权限'
    })

  } catch (error) {
    console.error('Demote error:', error)
    return NextResponse.json({
      success: false,
      message: '操作失败'
    }, { status: 500 })
  }
} 