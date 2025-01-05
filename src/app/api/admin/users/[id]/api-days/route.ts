import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import type { RowDataPacket, FieldPacket } from 'mysql2'

interface ExpiryResult extends RowDataPacket {
  new_expiry: string | null
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { days } = await request.json()
    const userId = parseInt(params.id)

    if (isNaN(days) || days <= 0) {
      return NextResponse.json({
        success: false,
        message: '无效的天数'
      }, { status: 400 })
    }

    // 更新所有属于该用户的 API 密钥的过期时间
    await pool.query(`
      UPDATE api_keys 
      SET expires_at = DATE_ADD(
        GREATEST(
          expires_at,
          NOW()
        ),
        INTERVAL ? DAY
      )
      WHERE user_id = ?
    `, [days, userId])

    // 获取最新的过期时间
    const result = await pool.query<ExpiryResult[]>(`
      SELECT MAX(expires_at) as new_expiry
      FROM api_keys
      WHERE user_id = ?
    `, [userId])
    const [rows] = result as unknown as [ExpiryResult[], FieldPacket[]]

    const newExpiryDate = rows[0]?.new_expiry

    return NextResponse.json({
      success: true,
      message: '已添加使用时间',
      newExpiryDate
    })

  } catch (error) {
    console.error('Add API days error:', error)
    return NextResponse.json({
      success: false,
      message: '操作失败'
    }, { status: 500 })
  }
} 