import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // 删除 token cookie
    cookieStore.delete('token')

    return NextResponse.json({
      success: true,
      message: '已退出登录'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({
      success: false,
      message: '退出登录失败'
    }, { status: 500 })
  }
} 