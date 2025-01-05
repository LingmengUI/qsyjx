import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

const ADMIN_KEY = process.env.ADMIN_KEY || '123456'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== ADMIN_KEY) {
    return NextResponse.json({
      success: false,
      message: '无权限执行此操作'
    }, { status: 403 })
  }

  try {
    // 按照依赖关系顺序删除表
    await pool.query('DROP TABLE IF EXISTS usage_logs')
    await pool.query('DROP TABLE IF EXISTS verify_codes')
    await pool.query('DROP TABLE IF EXISTS api_keys')
    await pool.query('DROP TABLE IF EXISTS usage_stats')
    await pool.query('DROP TABLE IF EXISTS system_settings')
    await pool.query('DROP TABLE IF EXISTS users')

    return NextResponse.json({
      success: true,
      message: '数据库清理完成'
    })

  } catch (error) {
    console.error('Database cleanup error:', error)
    return NextResponse.json({
      success: false,
      message: '数据库清理失败'
    }, { status: 500 })
  }
} 