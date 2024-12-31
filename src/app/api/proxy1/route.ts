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

    const apiUrl = `https://api.kxzjoker.cn/API/jiexi_video.php?url=${encodeURIComponent(url.trim())}`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': 'https://api.kxzjoker.cn/API/jiexi_video.php',
        'Host': 'api.kxzjoker.cn',
        'Origin': 'https://api.kxzjoker.cn',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      return NextResponse.json(
        { 
          code: response.status, 
          msg: `请求失败: ${response.status}`,
          error: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { 
        code: 500, 
        msg: error instanceof Error ? error.message : "服务器内部错误",
        error: error instanceof Error ? error.toString() : undefined
      },
      { status: 500 }
    )
  }
} 