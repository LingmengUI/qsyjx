import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { getCache, setCache } from '@/lib/redis'
import type { RowDataPacket, FieldPacket } from 'mysql2'

interface AdminStats extends RowDataPacket {
  totalUsers: number
  adminCount: number
  userCount: number
  totalApiKeys: number
  activeApiKeys: number
  todayRequests: number
  totalRequests: number
  activeUsersToday: number
  totalQuota: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

export async function GET() {
  try {
    // 1. 验证管理员权限
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未登录'
      }, { status: 401 })
    }

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

    // 2. 尝试从缓存获取
    const cachedStats = await getCache<AdminStats>('admin:stats')
    if (cachedStats) {
      return NextResponse.json({
        success: true,
        stats: cachedStats
      })
    }

    // 3. 从数据库获取完整统计数据
    const [rows] = await pool.query<AdminStats[]>(`
      SELECT 
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) FROM users) as adminCount,
        (SELECT SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) FROM users) as userCount,
        (SELECT COUNT(*) FROM api_keys) as totalApiKeys,
        (SELECT COUNT(*) FROM api_keys WHERE expires_at > NOW()) as activeApiKeys,
        (SELECT COUNT(*) FROM usage_logs WHERE DATE(used_at) = CURDATE()) as todayRequests,
        (SELECT COUNT(*) FROM usage_logs) as totalRequests,
        (SELECT COUNT(DISTINCT user_id) FROM usage_logs WHERE DATE(used_at) = CURDATE()) as activeUsersToday,
        (SELECT COALESCE(SUM(total_quota), 0) FROM api_keys) as totalQuota
    `) as unknown as [AdminStats[], FieldPacket[]]

    const stats = rows[0]
    
    // 4. 缓存结果
    await setCache('admin:stats', stats, 30) // 缓存30秒

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json({
      success: false,
      message: '获取统计数据失败'
    }, { status: 500 })
  }
} 