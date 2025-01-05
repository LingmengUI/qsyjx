import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import type { RowDataPacket, FieldPacket } from 'mysql2'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    const query = key 
      ? 'SELECT setting_key, value FROM system_settings WHERE setting_key = ?'
      : 'SELECT setting_key, value FROM system_settings'
    
    const params = key ? [key] : []
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params) as unknown as [RowDataPacket[], FieldPacket[]]

    if (key) {
      const setting = rows[0]
      return NextResponse.json({
        success: true,
        value: setting?.value || ''
      })
    }

    const settings = rows.reduce((acc, row) => ({
      ...acc,
      [row.setting_key]: row.value
    }), {})

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({
      success: false,
      message: '获取设置失败'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // 验证管理员权限
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
      role: string
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: '无权限'
      }, { status: 403 })
    }

    const { key, value } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json({
        success: false,
        message: '参数错误'
      }, { status: 400 })
    }

    // 更新设置
    await pool.query(
      'UPDATE system_settings SET value = ? WHERE setting_key = ?',
      [value, key]
    )

    return NextResponse.json({
      success: true,
      message: '更新成功'
    })

  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({
      success: false,
      message: '更新失败'
    }, { status: 500 })
  }
} 