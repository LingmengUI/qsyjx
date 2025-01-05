"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Shield, 
  Trash2, 
  Clock,
  UserCog,
  Users,
  Search
} from "lucide-react"
import { Toast } from "@/components/ui/toast"
import { PageSkeleton } from "@/components/ui/page-skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'user'
  created_at: string
  api_expires?: string
  api_keys?: {
    token: string
    used_at: string
    last_used?: string
    total_requests: number
  }[]
}

// 添加超级管理员邮箱常量
const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'admin@example.com'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const [currentUser, setCurrentUser] = useState<{email: string} | null>(null)

  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    void fetchUsers()
    void getCurrentUser()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm)
    )
    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [searchTerm, users])

  // 获取当前登录用户信息
  const getCurrentUser = async () => {
    try {
      const response = await fetch('/api/user')
      const data = await response.json()
      if (data.success) {
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('获取当前用户信息失败:', error)
    }
  }

  // 判断是否为超级管理员
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (data.success) {
        setUsers(data.users.sort((a: User, b: User) => a.id - b.id))
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '加载失败', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handlePromote = async (email: string) => {
    try {
      const response = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setUsers(users.map(user => 
          user.email === email ? { ...user, role: 'admin' } : user
        ))
        setToast({ message: '已提升为管理员', type: 'success' })
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '操作失败', type: 'error' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此用户吗？此操作不可恢复。')) return

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setUsers(users.filter(user => user.id !== id))
        setToast({ message: '用户已删除', type: 'success' })
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '删除失败', type: 'error' })
    }
  }

  const handleAddApiDays = async (id: number) => {
    const days = prompt('请输入要添加的天数')
    if (!days) return

    const daysNum = parseInt(days)
    if (isNaN(daysNum) || daysNum <= 0) {
      setToast({ message: '请输入有效的天数', type: 'error' })
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${id}/api-days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: daysNum })
      })

      const data = await response.json()

      if (data.success) {
        setUsers(users.map(user => 
          user.id === id ? { ...user, api_expires: data.newExpiryDate } : user
        ))
        setToast({ message: `已添加 ${daysNum} 天使用时间`, type: 'success' })
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '操作失败', type: 'error' })
    }
  }

  const handleDemote = async (email: string) => {
    try {
      const response = await fetch('/api/admin/demote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setUsers(users.map(user => 
          user.email === email ? { ...user, role: 'user' } : user
        ))
        setToast({ message: '已撤销管理员权限', type: 'success' })
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '操作失败', type: 'error' })
    }
  }

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // 生成页码数组
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5 // 最多显示的页码数
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // 否则显示部分页码和省略号
      if (currentPage <= 3) {
        // 当前页靠近开始
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // 当前页靠近结束
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        // 当前页在中间
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      }
    }
    return pageNumbers
  }

  if (loading) {
    return <PageSkeleton />
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-violet-500 rounded-xl">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">用户管理</h1>
            <p className="text-sm text-muted-foreground mt-1">管理系统用户和权限</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索用户..."
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>用户信息</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>API 过期时间</TableHead>
              <TableHead>API 使用情况</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-sm">{user.id}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{user.name || '未设置昵称'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-violet-100 text-violet-700 text-xs">
                      <Shield className="h-3 w-3" />
                      管理员
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">普通用户</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.api_expires ? (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(user.api_expires)}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.api_keys && user.api_keys.length > 0 ? (
                    <div className="space-y-2">
                      {user.api_keys.map((key, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {key.token.slice(0, 8)}...
                            </span>
                            {key.used_at && key.total_requests > 0 && (
                              <span className="text-muted-foreground">
                                最后使用: {formatDate(key.used_at)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            已使用 {key.total_requests} 次
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">未使用</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {((isSuperAdmin && user.email !== SUPER_ADMIN_EMAIL) || 
                    (currentUser?.email !== SUPER_ADMIN_EMAIL && user.role !== 'admin')) && (
                    <div className="flex items-center justify-end gap-2">
                      {user.role === 'admin' ? (
                        isSuperAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemote(user.email)}
                            className="flex items-center gap-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                          >
                            <Shield className="h-4 w-4" />
                            撤销权限
                          </Button>
                        )
                      ) : (
                        <>
                          {isSuperAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromote(user.email)}
                              className="flex items-center gap-1"
                            >
                              <UserCog className="h-4 w-4" />
                              提升权限
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddApiDays(user.id)}
                            className="flex items-center gap-1"
                          >
                            <Clock className="h-4 w-4" />
                            添加天数
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            删除
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-center items-center gap-1 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          上一页
        </Button>
        
        {getPageNumbers().map((pageNum, index) => (
          <Button
            key={index}
            variant={pageNum === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
            disabled={pageNum === '...'}
            className={cn(
              "min-w-[32px]",
              pageNum === '...' && "hover:bg-transparent cursor-default"
            )}
          >
            {pageNum}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          下一页
        </Button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
} 