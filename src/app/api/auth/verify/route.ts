import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import type { RowDataPacket, FieldPacket } from 'mysql2'

interface ApiKey extends RowDataPacket {
  token: string
  plan: 'basic' | 'pro' | 'enterprise'
  remaining_quota: number
  expires_at: Date
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({
        success: false,
        message: '请提供 API Token'
      }, { status: 400 })
    }

    // 从数据库查询 API 密钥信息
    const [rows] = (await pool.query<ApiKey[]>(`
      SELECT * FROM api_keys 
      WHERE token = ? AND expires_at > NOW()
    `, [token])) as unknown as [ApiKey[], FieldPacket[]]

    const apiKey = rows[0]

    // 添加调试日志
    console.log('API Key data:', apiKey)

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'API Token 无效或已过期'
      }, { status: 401 })
    }

    // 检查剩余配额
    if (apiKey.remaining_quota <= 0) {
      return NextResponse.json({
        success: false,
        message: '配额已用完'
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: {
        remainingCalls: apiKey.remaining_quota,
        plan: apiKey.plan,
        expiresAt: apiKey.expires_at
      }
    })

  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({
      success: false,
      message: '验证失败'
    }, { status: 500 })
  }
} 