"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Settings, Book, HelpCircle, Mail, Save } from "lucide-react"
import { Toast } from "@/components/ui/toast"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageSkeleton } from "@/components/ui/page-skeleton"

interface Settings {
  tutorial: string
  faq: string
  contact_email: string
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings>({
    tutorial: '',
    faq: '',
    contact_email: ''
  })
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  useEffect(() => {
    void fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()

      if (data.success) {
        setSettings(data.settings)
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '加载失败', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const data = await response.json()

      if (data.success) {
        setToast({ message: '保存成功', type: 'success' })
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '保存失败', type: 'error' })
    }
  }

  if (loading) {
    return <PageSkeleton />
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-500 rounded-xl">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">系统设置</h1>
            <p className="text-muted-foreground mt-1">管理系统的全局设置</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          size="lg"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          保存设置
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Book className="h-5 w-5 text-violet-500" />
            <h2 className="text-lg font-semibold">使用教程</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>教程内容</Label>
              <span className="text-xs text-muted-foreground">支持 HTML</span>
            </div>
            <Textarea
              value={settings.tutorial}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setSettings(prev => ({ ...prev, tutorial: e.target.value }))
              }
              placeholder="输入使用教程内容..."
              className="min-h-[200px] font-mono"
            />
            <div className="text-xs text-muted-foreground mt-2">
              提示：可以使用 HTML 标签来格式化内容，例如 &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt; 等
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-violet-500" />
            <h2 className="text-lg font-semibold">常见问题</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>问题内容</Label>
              <span className="text-xs text-muted-foreground">支持 HTML</span>
            </div>
            <Textarea
              value={settings.faq}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setSettings(prev => ({ ...prev, faq: e.target.value }))
              }
              placeholder="输入常见问题内容..."
              className="min-h-[200px] font-mono"
            />
            <div className="text-xs text-muted-foreground mt-2">
              建议：使用 &lt;strong&gt; 标签来突出问题，使用 &lt;p&gt; 标签来分隔答案
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="h-5 w-5 text-violet-500" />
            <h2 className="text-lg font-semibold">联系方式</h2>
          </div>
          <div className="space-y-2">
            <Label>联系邮箱</Label>
            <Input
              value={settings.contact_email}
              onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
              placeholder="输入联系邮箱..."
              type="email"
              className="max-w-md"
            />
            <div className="text-xs text-muted-foreground mt-2">
              此邮箱将显示在前端页面的&quot;联系我们&quot;按钮中
            </div>
          </div>
        </Card>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
} 