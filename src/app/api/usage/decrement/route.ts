import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import type { PoolConnection } from 'mysql2/promise'
import type { RowDataPacket, FieldPacket, ResultSetHeader } from 'mysql2'

interface ApiKey extends RowDataPacket {
  remaining_quota: number
}

export async function POST(request: Request) {
  let connection: PoolConnection | null = null

  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({
        success: false,
        message: '缺少必要参数'
      })
    }

    // 获取数据库连接
    connection = await new Promise<PoolConnection>((resolve, reject) => {
      pool.getConnection((err, conn) => {
        if (err) reject(err)
        else resolve(conn)
      })
    })

    // 开始事务
    await new Promise((resolve, reject) => {
      connection!.beginTransaction((err) => {
        if (err) reject(err)
        else resolve(undefined)
      })
    })

    // 检查剩余配额
    const [rows] = await new Promise<[ApiKey[], FieldPacket[]]>((resolve, reject) => {
      connection!.query<ApiKey[]>(
        'SELECT remaining_quota FROM api_keys WHERE token = ? FOR UPDATE',
        [token],
        (err, rows, fields) => {
          if (err) reject(err)
          else resolve([rows, fields])
        }
      )
    })

    const apiKey = rows[0]

    if (!apiKey || apiKey.remaining_quota <= 0) {
      await new Promise((resolve, reject) => {
        connection!.rollback((err) => {
          if (err) reject(err)
          else resolve(undefined)
        })
      })
      return NextResponse.json({
        success: false,
        message: '配额不足或令牌无效'
      })
    }

    // 减少配额
    await new Promise<ResultSetHeader>((resolve, reject) => {
      connection!.query(
        'UPDATE api_keys SET remaining_quota = remaining_quota - 1 WHERE token = ?',
        [token],
        (err, result) => {
          if (err) reject(err)
          else resolve(result as ResultSetHeader)
        }
      )
    })

    // 记录使用日志
    await new Promise<ResultSetHeader>((resolve, reject) => {
      connection!.query(
        'INSERT INTO usage_logs (token) VALUES (?)',
        [token],
        (err, result) => {
          if (err) reject(err)
          else resolve(result as ResultSetHeader)
        }
      )
    })

    // 提交事务
    await new Promise((resolve, reject) => {
      connection!.commit((err) => {
        if (err) reject(err)
        else resolve(undefined)
      })
    })

    return NextResponse.json({
      success: true,
      message: '配额更新成功',
      data: {
        remainingCalls: apiKey.remaining_quota - 1
      }
    })

  } catch (error) {
    // 发生错误时回滚事务
    if (connection) {
      try {
        await new Promise<void>((resolve) => {
          connection!.rollback(() => resolve())
        })
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError)
      }
    }
    console.error('Decrement error:', error)
    return NextResponse.json({
      success: false,
      message: '配额更新失败'
    }, { status: 500 })
  } finally {
    // 释放连接
    if (connection) {
      try {
        await new Promise<void>((resolve) => {
          connection!.release()
          resolve()
        })
      } catch (releaseError) {
        console.error('Release error:', releaseError)
      }
    }
  }
} 