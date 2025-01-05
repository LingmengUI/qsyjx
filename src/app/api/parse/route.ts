import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import type { RowDataPacket, FieldPacket } from 'mysql2'

interface ApiKeyInfo extends RowDataPacket {
  id: number
  token: string
  plan: 'basic' | 'pro' | 'enterprise'
  total_quota: number
  remaining_quota: number
  expires_at: string
  created_at: string
}

export async function POST(request: Request) {
  try {
    const { url, apiKey, algorithm, userId } = await request.json()

    if (!url || !apiKey || !algorithm) {
      return NextResponse.json({
        success: false,
        message: '请提供完整参数'
      }, { status: 400 })
    }

    // 验证 API Key 并检查配额
    try {
      const [rows] = await pool.query<ApiKeyInfo[]>(`
        SELECT * FROM api_keys 
        WHERE token = ? AND expires_at > NOW() AND remaining_quota > 0
      `, [apiKey]) as unknown as [ApiKeyInfo[], FieldPacket[]]

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'API Key 无效或已过期或配额已用完'
        }, { status: 403 })
      }

      const apiKeyInfo = rows[0]
      console.log('Using API key:', { token: apiKey, plan: apiKeyInfo.plan })

      try {
        // 记录使用并更新配额
        await Promise.all([
          pool.query(`
            INSERT INTO usage_logs (token, user_id, used_at, request_url, response_status) 
            VALUES (?, ?, NOW(), ?, ?)
          `, [apiKey, userId || null, url, 200]),
          pool.query(`
            UPDATE api_keys 
            SET remaining_quota = remaining_quota - 1 
            WHERE token = ?
          `, [apiKey])
        ])

        return NextResponse.json({
          success: true,
          quota: {
            remaining: apiKeyInfo.remaining_quota - 1,
            total: apiKeyInfo.total_quota
          }
        })
      } catch (error) {
        console.error('Update quota error:', error)
        throw error
      }
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  } catch (error) {
    console.error('Parse request error:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : '解析失败，请稍后重试'
    }, { status: 500 })
  }
} 