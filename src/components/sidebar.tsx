"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Users,
  Key,
  BarChart3,
  Settings,
  Bell,
  Menu,
  Home,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const sidebarItems = [
  {
    title: "概览",
    href: "/admin",
    icon: BarChart3
  },
  {
    title: "用户管理",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "API 密钥",
    href: "/admin/api-keys",
    icon: Key
  },
  {
    title: "公告管理",
    href: "/admin/announcement",
    icon: Bell
  },
  {
    title: "系统设置",
    href: "/admin/settings",
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <>
      {/* 遮罩层 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64",
        "bg-background border-r transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        {/* 关闭按钮 */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className={cn(
            "lg:hidden absolute -right-6 top-1/2 -translate-y-1/2",
            "h-16 w-6 flex items-center justify-center",
            "bg-background border border-l-0 rounded-r-md",
            "transition-transform duration-300",
            !isSidebarOpen && "translate-x-full opacity-0"
          )}
          aria-label="关闭菜单"
        >
          <ChevronLeft className="w-3 h-3 text-violet-500" />
        </button>

        <div className="h-full flex flex-col">
          {/* 标题 */}
          <div className="h-16 flex items-center gap-2 px-6 border-b">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="font-semibold">管理控制台</span>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg text-sm",
                        "transition-colors duration-200",
                        isActive
                          ? "bg-violet-50 text-violet-900 font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* 底部信息 */}
          <div className="p-4 border-t text-xs text-muted-foreground">
            <p>© 2025 解析助手</p>
          </div>
        </div>
      </aside>

      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="flex h-16 items-center gap-4 px-6">
          {/* 移动端汉堡菜单 */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={cn(
              "lg:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent",
              "transition-colors"
            )}
            aria-label="打开菜单"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* 返回主页按钮 - 在电脑端显示在左侧 */}
          <div className={cn(
            "hidden lg:block lg:pl-64", // 电脑端显示并左对齐
            "absolute left-0 right-0" // 占满宽度以便定位
          )}>
            <Link 
              href="/"
              className="flex items-center gap-2 px-6 text-sm font-medium hover:text-violet-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              返回主页
            </Link>
          </div>

          {/* 移动端返回主页按钮 */}
          <Link 
            href="/"
            className="lg:hidden flex items-center gap-2 text-sm font-medium hover:text-violet-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            返回主页
          </Link>
        </div>
      </header>

      {/* 展开按钮 */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-50",
          "h-16 w-6 flex items-center justify-center",
          "bg-background border border-r rounded-r-md",
          "transition-transform duration-300 lg:hidden",
          isSidebarOpen && "-translate-x-full opacity-0"
        )}
        aria-label="打开菜单"
      >
        <ChevronRight className="w-3 h-3 text-violet-500" />
      </button>
    </>
  )
} 