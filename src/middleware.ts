import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // 只对管理员路由进行保护
  if (isAdminRoute && !token) {
    // 如果是管理员路由且没有 token，重定向到首页
    return NextResponse.redirect(new URL('/', request.url))
  }

  // API 路由不需要重定向，让它们自己处理认证
  if (isApiRoute) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 需要保护的路由
    '/admin/:path*',
    // API 路由
    '/api/:path*',
  ]
} 