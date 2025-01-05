import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import type { ResultSetHeader, FieldPacket } from 'mysql2'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

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
      role: string
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: '无权限执行此操作'
      }, { status: 403 })
    }

    // 删除密钥
    await (pool.query(`
      DELETE FROM api_keys WHERE id = ?
    `, [params.id]) as unknown as Promise<[ResultSetHeader, FieldPacket[]]>)

    return NextResponse.json({
      success: true,
      message: '密钥已删除'
    })

  } catch (error) {
    console.error('Delete API key error:', error)
    return NextResponse.json({
      success: false,
      message: '删除失败'
    }, { status: 500 })
  }
} 