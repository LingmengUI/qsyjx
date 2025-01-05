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
      url: url.trim()
    })

    // 使用第一个 API 端点
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL_1 + '?' + params.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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

    // 转换响应格式以匹配前端期望的格式
    if (data.success) {
      // 检查是否是图片内容
      if ((!data.data.video_url || data.data.video_url === '') && 
          (!data.data.download_url || data.data.download_url === '') && 
          data.data.image_url) {
        return NextResponse.json({
          code: 0,
          msg: "success",
          data: {
            title: data.data.video_title || '',
            type: "2",  // 标记为图片类型
            pics: [data.data.image_url],  // 将图片URL放入数组
            cover_url: data.data.image_url
          }
        })
      }

      // 视频内容
      const videoUrl = data.data.download_url || data.data.video_url || ''
      return NextResponse.json({
        code: 0,
        msg: "success",
        data: {
          title: data.data.video_title || '',
          video_url: videoUrl,
          cover_url: data.data.image_url || '',
          type: videoUrl ? "1" : "2",  // 如果没有视频链接，就当作图片处理
          ...((!videoUrl && data.data.image_url) ? { pics: [data.data.image_url] } : {})
        }
      })
    }

    return NextResponse.json({
      code: 500,
      msg: data.msg || "解析失败",
      data: null
    })

  } catch (error) {
    return NextResponse.json(
      { code: 500, msg: error instanceof Error ? error.message : "服务器内部错误" },
      { status: 500 }
    )
  }
}