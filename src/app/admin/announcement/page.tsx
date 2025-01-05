"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Toast } from "@/components/ui/toast"
import { Loader2 } from "lucide-react"

export default function AnnouncementPage() {
  const [announcement, setAnnouncement] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch('/api/settings?key=announcement')
        const data = await response.json()
        if (data.success) {
          setAnnouncement(data.value)
        }
      } catch (error) {
        console.error('Failed to fetch announcement:', error)
      }
    }

    void fetchAnnouncement()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'announcement',
          value: announcement
        })
      })

      const data = await response.json()

      if (data.success) {
        setToast({ message: '公告更新成功', type: 'success' })
      } else {
        setToast({ message: data.message || '更新失败', type: 'error' })
      }
    } catch {
      setToast({ message: '更新失败', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <Card className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">公告管理</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                公告内容
                <span className="text-xs text-muted-foreground ml-2">
                  (支持 HTML)
                </span>
              </label>
              <Textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="min-h-[200px]"
                placeholder="输入公告内容..."
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存公告'
              )}
            </Button>
          </div>
        </form>
      </Card>

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