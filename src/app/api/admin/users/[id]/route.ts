import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { deleteCache } from '@/lib/redis'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

// 删除用户
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
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
      userId: number
      role: string
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: '无权限执行此操作'
      }, { status: 403 })
    }

    // 不允许删除自己
    if (decoded.userId === parseInt(params.id)) {
      return NextResponse.json({
        success: false,
        message: '不能删除自己的账号'
      }, { status: 400 })
    }

    await pool.query(
      'DELETE FROM users WHERE id = ?',
      [params.id]
    )

    // 删除用户列表缓存
    await deleteCache('admin:users')

    return NextResponse.json({
      success: true,
      message: '用户已删除'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({
      success: false,
      message: '删除失败'
    }, { status: 500 })
  }
} 