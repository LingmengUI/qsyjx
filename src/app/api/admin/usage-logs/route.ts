import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCache, setCache } from '@/lib/redis'
import type { RowDataPacket, FieldPacket } from 'mysql2'

interface UsageLog extends RowDataPacket {
  id: number
  token: string
  user_id: number
  user_email: string
  used_at: string
  request_url: string
  response_status: number
}

interface TotalCount extends RowDataPacket {
  total: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // 生成缓存键，包含分页参数
    const cacheKey = `admin:usage-logs:${page}:${limit}`

    // 尝试从缓存获取
    const cachedLogs = await getCache<{
      logs: UsageLog[]
      total: number
    }>(cacheKey)
    if (cachedLogs) {
      return NextResponse.json({
        success: true,
        ...cachedLogs
      })
    }

    // 修复类型错误
    const [logs] = await pool.query(`
      SELECT 
        ul.*,
        u.email as user_email
      FROM usage_logs ul
      LEFT JOIN api_keys ak ON ul.token = ak.token
      LEFT JOIN users u ON ak.user_id = u.id
      WHERE DATE(ul.used_at) = CURDATE()
      ORDER BY ul.used_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]) as unknown as [UsageLog[], FieldPacket[]]

    // 修复总数查询的类型
    const [totalRows] = await pool.query(`
      SELECT COUNT(*) as total FROM usage_logs
    `) as unknown as [TotalCount[], FieldPacket[]]

    const result = {
      logs,
      total: totalRows[0].total
    }

    // 缓存 5 分钟
    await setCache(cacheKey, result, 300)

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Get usage logs error:', error)
    return NextResponse.json({
      success: false,
      message: '获取使用记录失败'
    }, { status: 500 })
  }
} 