import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCache, setCache } from '@/lib/redis'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import type { RowDataPacket, FieldPacket } from 'mysql2'

interface User extends RowDataPacket {
  id: number
  email: string
  name: string
  role: 'admin' | 'user'
  created_at: string
  api_expires?: string
  api_usage?: string
}

interface ProcessedUser extends Omit<User, 'api_usage'> {
  api_keys: {
    token: string
    used_at: string
    total_requests: number
  }[]
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

    // 验证 token 并检查是否为管理员
    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      userId: number
      email: string
      role: string
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: '无权限访问'
      }, { status: 403 })
    }

    // 尝试从缓存获取数据
    const cachedUsers = await getCache<ProcessedUser>('admin:users')
    if (cachedUsers) {
      return NextResponse.json({
        success: true,
        users: cachedUsers
      })
    }

    // 如果缓存不存在，从数据库获取
    const result = await pool.query<User[]>(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.created_at,
        (
          SELECT MAX(expires_at)
          FROM api_keys
          WHERE user_id = u.id
        ) as api_expires,
        (
          SELECT GROUP_CONCAT(
            JSON_OBJECT(
              'token', ak.token,
              'used_at', (
                SELECT MAX(used_at)
                FROM usage_logs ul
                WHERE ul.token = ak.token
              ),
              'total_requests', (
                SELECT COUNT(*)
                FROM usage_logs ul
                WHERE ul.token = ak.token
              )
            )
          )
          FROM api_keys ak
          WHERE ak.user_id = u.id
        ) as api_usage
      FROM users u
      ORDER BY u.id ASC
    `)
    const [users] = result as unknown as [User[], FieldPacket[]]

    // 处理 API 使用数据
    const processedUsers: ProcessedUser[] = users.map(user => ({
      ...user,
      api_keys: user.api_usage && user.api_usage !== 'null'
        ? JSON.parse(`[${user.api_usage}]`)
        : []
    }))

    // 缓存数据 5 分钟
    await setCache('admin:users', processedUsers, 300)

    return NextResponse.json({
      success: true,
      users: processedUsers
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({
      success: false,
      message: '获取用户列表失败'
    }, { status: 500 })
  }
} 