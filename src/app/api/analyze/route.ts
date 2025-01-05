import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import type { RowDataPacket, FieldPacket } from 'mysql2'

interface ApiKey extends RowDataPacket {
  id: number
  token: string
  remaining_quota: number
}

export async function POST(request: Request) {
  try {
    const { url, algorithm } = await request.json()
    
    // 验证 API Key
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: '请提供 API Key'
      }, { status: 401 })
    }

    const apiKey = authHeader.replace('Bearer ', '')

    // 检查 API Key 是否有效
    const [keys] = await pool.query<ApiKey[]>(
      'SELECT * FROM api_keys WHERE token = ? AND expires_at > NOW()',
      [apiKey]
    ) as unknown as [ApiKey[], FieldPacket[]]

    if (!keys.length) {
      return NextResponse.json({
        success: false,
        message: 'API Key 无效或已过期'
      }, { status: 401 })
    }

    const key = keys[0]
    if (key.remaining_quota <= 0) {
      return NextResponse.json({
        success: false,
        message: '配额已用完'
      }, { status: 403 })
    }

    // 转发请求到实际的解析服务
    const proxyResponse = await fetch(`/api/proxy${algorithm}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })

    const data = await proxyResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({
      success: false,
      message: '解析失败'
    }, { status: 500 })
  }
} 