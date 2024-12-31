import { NextResponse } from 'next/server'

// 添加 GET 请求处理
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoUrl = searchParams.get('url')

    if (!videoUrl) {
      return new NextResponse('Missing video URL', { status: 400 })
    }

    // 获取原始视频
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        'Range': request.headers.get('range') || 'bytes=0-',
        'Referer': new URL(videoUrl).origin,
      },
    })

    if (!response.ok && response.status !== 206) {
      throw new Error(`Video fetch failed: ${response.status}`)
    }

    // 获取内容信息
    const contentType = response.headers.get('content-type')
    const contentLength = response.headers.get('content-length')
    const contentRange = response.headers.get('content-range')

    // 创建响应头
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Content-Type': contentType || 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    })

    // 如果有 Content-Length，则设置
    if (contentLength) {
      headers.set('Content-Length', contentLength)
    }

    // 如果有 Content-Range，则设置
    if (contentRange) {
      headers.set('Content-Range', contentRange)
      return new NextResponse(response.body, {
        status: 206,
        headers,
      })
    }

    // 返回完整响应
    return new NextResponse(response.body, {
      status: response.status,
      headers,
    })

  } catch (error) {
    console.error('Video proxy error:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    )
  }
}

// 添加 HEAD 请求处理
export async function HEAD(request: Request) {
  return GET(request)
}

// 添加 OPTIONS 请求处理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Max-Age': '86400',
    },
  })
} 