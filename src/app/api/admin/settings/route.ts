import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import type { RowDataPacket, FieldPacket } from 'mysql2'
import { deleteCache } from '@/lib/redis'

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

    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      role: string
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: '无权限访问'
      }, { status: 403 })
    }

    const [rows] = await pool.query(`
      SELECT setting_key, value FROM system_settings
    `) as unknown as [RowDataPacket[], FieldPacket[]]

    const settings = rows.reduce((acc, row) => ({
      ...acc,
      [row.setting_key]: row.value
    }), {
      tutorial: '',
      faq: '',
      contact_email: ''
    })

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
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未登录'
      }, { status: 401 })
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      role: string
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: '无权限访问'
      }, { status: 403 })
    }

    const { tutorial, faq, contact_email } = await request.json()

    await pool.query(`
      REPLACE INTO system_settings (setting_key, value) VALUES 
      ('tutorial', ?),
      ('faq', ?),
      ('contact_email', ?)
    `, [tutorial, faq, contact_email])

    // 清除设置缓存
    await deleteCache('public:settings')

    return NextResponse.json({
      success: true,
      message: '保存成功'
    })

  } catch (error) {
    console.error('Save settings error:', error)
    return NextResponse.json({
      success: false,
      message: '保存失败'
    }, { status: 500 })
  }
} 