import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import type { ResultSetHeader, FieldPacket, RowDataPacket } from 'mysql2'
import { generateApiKey } from '@/lib/utils'
import { getCache, setCache, deleteCache } from '@/lib/redis'

interface ApiKey extends RowDataPacket {
  id: number
  token: string
  user_id: number
  plan: string
  total_quota: number
  remaining_quota: number
  expires_at: string
  created_at: string
  user_email?: string
}

interface DbError extends Error {
  sqlMessage?: string
}

interface ApiKeyResult extends ApiKey {
  total_requests: number
}

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

    const { 
      length = 32, 
      expiryDays = 30,
      totalQuota = 1000,
      plan = 'basic',
      userId
    } = await request.json()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '请指定用户'
      }, { status: 400 })
    }

    console.log('Creating new API key with plan:', plan)

    const apiKey = generateApiKey(length)

    // 计算过期时间
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiryDays)

    // 插入新密钥到数据库
    const [result] = await (pool.query(`
      INSERT INTO api_keys (token, user_id, plan, total_quota, remaining_quota, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [apiKey, userId, plan, totalQuota, totalQuota, expiresAt]) as unknown as Promise<[ResultSetHeader, FieldPacket[]]>)

    // 获取新创建的密钥信息
    const [rows] = await (pool.query(`
      SELECT * FROM api_keys WHERE id = ?
    `, [result.insertId]) as unknown as Promise<[ApiKey[], FieldPacket[]]>)

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('Failed to get created API key')
    }

    await deleteCache('admin:api-keys')

    return NextResponse.json({
      success: true,
      message: '密钥创建成功',
      apiKey: rows[0]
    })

  } catch (error) {
    console.error('Create API key error:', error)
    const dbError = error as DbError
    return NextResponse.json({
      success: false,
      message: dbError.sqlMessage || dbError.message || '创建失败'
    }, { status: 500 })
  }
}

// 获取所有 API 密钥
export async function GET() {
  try {
    // 尝试从缓存获取
    const cachedKeys = await getCache<ApiKeyResult[]>('admin:api-keys')
    if (cachedKeys) {
      return NextResponse.json({
        success: true,
        keys: cachedKeys
      })
    }

    // 使用正确的类型
    const result = await pool.query(`
      SELECT 
        ak.*,
        u.email as user_email,
        (
          SELECT COUNT(*) 
          FROM usage_logs ul 
          WHERE ul.token = ak.token
        ) as total_requests
      FROM api_keys ak
      LEFT JOIN users u ON ak.user_id = u.id
      ORDER BY ak.created_at DESC
    `) as unknown as [ApiKeyResult[], FieldPacket[]]

    const [keys] = result

    // 缓存 5 分钟
    await setCache('admin:api-keys', keys, 300)

    return NextResponse.json({
      success: true,
      keys
    })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json({
      success: false,
      message: '获取密钥列表失败'
    }, { status: 500 })
  }
}

// 添加删除 API 密钥的方法
export async function DELETE(request: Request) {
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

    // 从 URL 获取要删除的密钥 ID
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        message: '未提供密钥 ID'
      }, { status: 400 })
    }

    // 删除密钥
    // 由于设置了外键约束，usage_logs 表中相关记录会自动删除
    const [result] = (await pool.query(
      'DELETE FROM api_keys WHERE id = ?',
      [id]
    )) as unknown as [ResultSetHeader, FieldPacket[]]

    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: '密钥不存在'
      }, { status: 404 })
    }

    await deleteCache('admin:api-keys')

    return NextResponse.json({
      success: true,
      message: '密钥删除成功'
    })

  } catch (error) {
    console.error('Delete API key error:', error)
    const dbError = error as DbError
    return NextResponse.json({
      success: false,
      message: dbError.sqlMessage || dbError.message || '删除失败'
    }, { status: 500 })
  }
} 