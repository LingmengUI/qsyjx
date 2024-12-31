import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 克隆响应头
  const requestHeaders = new Headers(request.headers)
  
  // 添加 CORS 和安全头
  requestHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp')
  requestHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin')
  requestHeaders.set('Cross-Origin-Opener-Policy', 'same-origin')

  // 返回修改后的请求
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 