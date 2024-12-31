import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    // 增强 URL 验证
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json(
        { code: 400, msg: "URL参数缺失或为空" },
        { status: 400 }
      )
    }

    // 构建请求参数
    const params = new URLSearchParams({
      url: url.trim(),
      type: '1',
      platform: 'douyin'
    })

    const response = await fetch('https://xzdx.top/api/duan?' + params.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://xzdx.top',
        'Referer': 'https://xzdx.top/'
      }
    })

    // 检查响应状态
    if (!response.ok) {
      return NextResponse.json(
        { code: response.status, msg: `请求失败: ${response.status}` },
        { status: response.status }
      )
    }

    // 尝试解析响应
    let data
    try {
      const text = await response.text()
      data = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { code: 500, msg: "API返回的数据格式无效" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { code: 500, msg: error instanceof Error ? error.message : "服务器内部错误" },
      { status: 500 }
    )
  }
}