import { NextResponse } from 'next/server'
import { pool, 
  createApiKeysTableSQL, 
  createUsageLogsTableSQL, 
  createUsersTableSQL, 
  createVerifyCodesTableSQL,
  createUsageStatsTableSQL,
  createSystemSettingsTableSQL,
  initSystemSettingsSQL 
} from '@/lib/db'
import type { QueryError } from 'mysql2'
import { clearCacheByPrefix } from '@/lib/redis'

const ADMIN_KEY = process.env.ADMIN_KEY

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== ADMIN_KEY) {
      return NextResponse.json({
        success: false,
        message: '无权限执行此操作'
      }, { status: 403 })
    }

    try {
      // 创建表
      await pool.query(createUsersTableSQL)
      await pool.query(createApiKeysTableSQL)
      await pool.query(createUsageLogsTableSQL)
      await pool.query(createVerifyCodesTableSQL)
      await pool.query(createUsageStatsTableSQL)
      await pool.query(createSystemSettingsTableSQL)

      // 初始化系统设置
      await pool.query(initSystemSettingsSQL)

      // 清除所有缓存
      await clearCacheByPrefix('*')

      return NextResponse.json({
        success: true,
        message: '数据库初始化成功'
      })

    } catch (err) {
      console.error('Specific initialization error:', err)
      const mysqlError = err as QueryError
      return NextResponse.json({
        success: false,
        message: `初始化失败: ${mysqlError.message || '未知错误'}`,
        error: mysqlError
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Database init error:', error)
    const mysqlError = error as QueryError
    return NextResponse.json({
      success: false,
      message: `数据库初始化失败: ${mysqlError.message || '未知错误'}`,
      error: mysqlError
    }, { status: 500 })
  }
} 