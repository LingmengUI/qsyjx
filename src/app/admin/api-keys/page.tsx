"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Key, 
  Plus,
  RefreshCw,
  Clock,
  Shield,
  KeyRound,
  Trash2,
  Copy,
  CheckCheck,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Toast } from "@/components/ui/toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageSkeleton } from "@/components/ui/page-skeleton"

interface ApiKey {
  id: number
  token: string
  plan: string
  total_quota: number
  remaining_quota: number
  expires_at: string
  created_at: string
  user_id: number
}

export default function ApiKeysPage() {
  const [loading, setLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [filteredKeys, setFilteredKeys] = useState<ApiKey[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const [renewDialog, setRenewDialog] = useState<{
    open: boolean
    keyId: number | null
    days: string
  }>({
    open: false,
    keyId: null,
    days: ''
  })
  const [createDialog, setCreateDialog] = useState<{
    open: boolean
    length: '32' | '16' | '8'
    expiryDays: string
    totalQuota: string
    plan: 'basic' | 'pro' | 'enterprise'
    userId: string
  }>({
    open: false,
    length: '32',
    expiryDays: '30',
    totalQuota: '1000',
    plan: 'basic',
    userId: ''
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    keyId: number | null
  }>({
    open: false,
    keyId: null
  })
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [quotaDialog, setQuotaDialog] = useState<{
    open: boolean
    keyId: number | null
    quota: string
  }>({
    open: false,
    keyId: null,
    quota: ''
  })

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    void fetchApiKeys()
  }, [])

  useEffect(() => {
    if (apiKeys) {
      const filtered = apiKeys.filter(key => 
        key.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.user_id?.toString().includes(searchTerm)
      )
      setFilteredKeys(filtered)
      setCurrentPage(1)
    }
  }, [searchTerm, apiKeys])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys')
      const data = await response.json()

      if (data.success) {
        setApiKeys(data.keys || [])
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '加载失败', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    const days = parseInt(createDialog.expiryDays)
    const quota = parseInt(createDialog.totalQuota)

    if (isNaN(days) || days <= 0) {
      setToast({ message: '请输入有效的天数', type: 'error' })
      return
    }

    if (isNaN(quota) || quota <= 0) {
      setToast({ message: '请输入有效的配额', type: 'error' })
      return
    }

    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          length: parseInt(createDialog.length),
          expiryDays: days,
          totalQuota: quota,
          plan: createDialog.plan,
          userId: Number(createDialog.userId)
        })
      })

      const data = await response.json()

      if (data.success) {
        setApiKeys([data.apiKey, ...apiKeys])
        setToast({ message: '密钥创建成功', type: 'success' })
        setCreateDialog(prev => ({ ...prev, open: false }))
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '创建失败', type: 'error' })
    }
  }

  const handleRenew = async (id: number) => {
    setRenewDialog({
      open: true,
      keyId: id,
      days: ''
    })
  }

  const handleRenewConfirm = async () => {
    if (!renewDialog.keyId || !renewDialog.days) return

    const days = parseInt(renewDialog.days)

    if (isNaN(days) || days <= 0) {
      setToast({ message: '请输入有效的天数', type: 'error' })
      return
    }

    try {
      const response = await fetch(`/api/admin/api-keys/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: renewDialog.keyId, 
          days
        })
      })

      const data = await response.json()

      if (data.success) {
        setApiKeys(apiKeys.map(key => 
          key.id === renewDialog.keyId 
            ? {
                ...key,
                expires_at: data.apiKey.expires_at,
                remaining_quota: data.apiKey.remaining_quota,
                total_quota: data.apiKey.total_quota
              }
            : key
        ))
        setToast({ message: '续期成功', type: 'success' })
        setRenewDialog({ open: false, keyId: null, days: '' })
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '续期失败', type: 'error' })
    }
  }

  const handleDelete = async (id: number) => {
    setDeleteDialog({
      open: true,
      keyId: id
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.keyId) return

    try {
      const response = await fetch(`/api/admin/api-keys/${deleteDialog.keyId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setApiKeys(apiKeys.filter(key => key.id !== deleteDialog.keyId))
        setToast({ message: '删除成功', type: 'success' })
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '删除失败', type: 'error' })
    } finally {
      setDeleteDialog({ open: false, keyId: null })
    }
  }

  const handleCopy = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000) // 2秒后重置复制状态
    } catch {
      setToast({ message: '复制失败', type: 'error' })
    }
  }

  const handleAddQuota = async (id: number) => {
    setQuotaDialog({
      open: true,
      keyId: id,
      quota: ''
    })
  }

  const handleQuotaConfirm = async () => {
    if (!quotaDialog.keyId || !quotaDialog.quota) return

    const quota = parseInt(quotaDialog.quota)

    if (isNaN(quota) || quota <= 0) {
      setToast({ message: '请输入有效的配额', type: 'error' })
      return
    }

    try {
      const response = await fetch(`/api/admin/api-keys/quota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: quotaDialog.keyId, 
          quota
        })
      })

      const data = await response.json()

      if (data.success) {
        setApiKeys(apiKeys.map(key => 
          key.id === quotaDialog.keyId 
            ? {
                ...key,
                remaining_quota: data.apiKey.remaining_quota,
                total_quota: data.apiKey.total_quota
              }
            : key
        ))
        setToast({ message: '增加配额成功', type: 'success' })
        setQuotaDialog({ open: false, keyId: null, quota: '' })
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '增加配额失败', type: 'error' })
    }
  }

  const totalPages = Math.ceil(filteredKeys.length / ITEMS_PER_PAGE)
  const paginatedKeys = filteredKeys.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (loading) {
    return <PageSkeleton />
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-violet-500 rounded-xl">
            <KeyRound className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">API 密钥管理</h1>
            <p className="text-sm text-muted-foreground mt-1">管理系统的 API 访问密钥</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索密钥..."
              className="pl-9 rounded-xl"
            />
          </div>
          <Button 
            onClick={() => setCreateDialog(prev => ({ ...prev, open: true }))}
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            创建密钥
          </Button>
        </div>
      </div>

      <Card className="divide-y">
        {paginatedKeys.map((key) => (
          <div
            key={key.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4 hover:bg-muted/50 transition-colors"
          >
            <div className="space-y-3 sm:space-y-2 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2">
                <Key className="h-4 w-4 text-violet-500 flex-shrink-0" />
                <code className="relative font-mono text-sm bg-muted px-2 py-1 rounded group flex-1 sm:flex-none overflow-hidden">
                  <span className="block truncate">{key.token}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopy(key.token, key.id)}
                  >
                    {copiedId === key.id ? (
                      <CheckCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </code>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                  {
                    'bg-slate-100 text-slate-700': key.plan === 'basic',
                    'bg-violet-100 text-violet-700': key.plan === 'pro',
                    'bg-indigo-100 text-indigo-700': key.plan === 'enterprise'
                  }
                )}>
                  {key.plan === 'basic' && '标准版'}
                  {key.plan === 'pro' && '专业版'}
                  {key.plan === 'enterprise' && '企业版'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">配额: {key.remaining_quota}/{key.total_quota}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">过期时间: {new Date(key.expires_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAddQuota(key.id)}
                className="flex items-center gap-1"
              >
                <Shield className="h-4 w-4" />
                增加配额
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRenew(key.id)}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                续期
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDelete(key.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                删除
              </Button>
            </div>
          </div>
        ))}
      </Card>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            上一页
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            下一页
          </Button>
        </div>
      )}

      <Dialog open={renewDialog.open} onOpenChange={(open) => setRenewDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[360px] sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">续期 API 密钥</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              请设置续期天数和增加的配额数量。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="days">续期天数</Label>
              <Input
                id="days"
                type="number"
                min="1"
                value={renewDialog.days}
                onChange={(e) => setRenewDialog(prev => ({ 
                  ...prev, 
                  days: e.target.value 
                }))}
                placeholder="请输入天数"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setRenewDialog({ open: false, keyId: null, days: '' })}
              className="w-full sm:w-auto rounded-xl"
            >
              取消
            </Button>
            <Button 
              onClick={handleRenewConfirm}
              className="w-full sm:w-auto rounded-xl"
            >
              确认续期
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createDialog.open} onOpenChange={(open) => setCreateDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[360px] sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">创建新的 API 密钥</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              请设置密钥的长度、有效期和使用配额。创建后，密钥将立即生效。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="length">密钥长度</Label>
              <Select
                value={createDialog.length}
                onValueChange={(value) => setCreateDialog(prev => ({ 
                  ...prev, 
                  length: value as '32' | '16' | '8'
                }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="选择密钥长度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="32">32 位密钥</SelectItem>
                  <SelectItem value="16">16 位密钥</SelectItem>
                  <SelectItem value="8">8 位密钥</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiryDays">有效期（天）</Label>
              <Input
                id="expiryDays"
                type="number"
                min="1"
                value={createDialog.expiryDays}
                onChange={(e) => setCreateDialog(prev => ({ 
                  ...prev, 
                  expiryDays: e.target.value 
                }))}
                placeholder="请输入天数"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalQuota">使用配额（次数）</Label>
              <Input
                id="totalQuota"
                type="number"
                min="1"
                value={createDialog.totalQuota}
                onChange={(e) => setCreateDialog(prev => ({ 
                  ...prev, 
                  totalQuota: e.target.value 
                }))}
                placeholder="请输入配额"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plan">计划类型</Label>
              <Select
                value={createDialog.plan}
                onValueChange={(value) => setCreateDialog(prev => ({ 
                  ...prev, 
                  plan: value as 'basic' | 'pro' | 'enterprise'
                }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="选择计划类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    标准版 - 基础 API 访问
                  </SelectItem>
                  <SelectItem value="pro">
                    专业版 - 高级功能 + 优先支持
                  </SelectItem>
                  <SelectItem value="enterprise">
                    企业版 - 定制功能 + 专属支持
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userId">用户 ID</Label>
              <Input
                id="userId"
                type="number"
                value={createDialog.userId}
                onChange={(e) => setCreateDialog(prev => ({ 
                  ...prev, 
                  userId: e.target.value 
                }))}
                placeholder="请输入用户 ID"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateDialog(prev => ({ ...prev, open: false }))}
              className="w-full sm:w-auto rounded-xl"
            >
              取消
            </Button>
            <Button 
              onClick={handleCreateKey}
              className="w-full sm:w-auto rounded-xl"
            >
              创建密钥
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[360px] sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">删除 API 密钥</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              您确定要删除此 API 密钥吗？此操作不可恢复，删除后密钥将立即失效。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, keyId: null })}
              className="w-full sm:w-auto rounded-xl"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700"
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={quotaDialog.open} onOpenChange={(open) => setQuotaDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[360px] sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">增加 API 密钥配额</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              请输入要增加的配额数量。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quota">增加配额</Label>
              <Input
                id="quota"
                type="number"
                min="1"
                value={quotaDialog.quota}
                onChange={(e) => setQuotaDialog(prev => ({ 
                  ...prev, 
                  quota: e.target.value 
                }))}
                placeholder="请输入要增加的配额数量"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setQuotaDialog({ open: false, keyId: null, quota: '' })}
              className="w-full sm:w-auto rounded-xl"
            >
              取消
            </Button>
            <Button 
              onClick={handleQuotaConfirm}
              className="w-full sm:w-auto rounded-xl"
            >
              确认增加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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