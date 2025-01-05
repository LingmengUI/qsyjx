import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json(
        { code: 400, msg: "URL参数缺失或为空" },
        { status: 400 }
      )
    }

    const params = new URLSearchParams({
      uid: process.env.NEXT_PUBLIC_UID || '',
      my: process.env.NEXT_PUBLIC_MY || '',
      url: url.trim()
    })

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL_2}/?${params.toString()}`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      return NextResponse.json(
        { code: response.status, msg: `请求失败: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { code: 500, msg: error instanceof Error ? error.message : "服务器内部错误" },
      { status: 500 }
    )
  }
} 