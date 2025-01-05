"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Toast } from "@/components/ui/toast"

type AuthMode = 'login' | 'register'

type AuthState = {
  isAuthenticated: boolean
  remainingCalls: number
  plan?: 'basic' | 'pro' | 'enterprise'
  expiresAt?: string
}

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  setAuthState: (state: AuthState) => void
}

export function LoginDialog({ open, onOpenChange, setAuthState }: LoginDialogProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [verifyCode, setVerifyCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setToast({ message: '请输入有效的邮箱地址', type: 'error' })
      return
    }

    setSendingCode(true)
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setToast({ message: '验证码已发送', type: 'success' })
        // 开始倒计时
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setToast({ message: data.message, type: 'error' })
      }
    } catch {
      setToast({ message: '发送失败', type: 'error' })
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 表单验证
    if (mode === 'register') {
      if (!email || !password || !name || !verifyCode) {
        setError('请填写所有必填字段')
        setLoading(false)
        return
      }
    } else {
      if (!email || !password) {
        setError('请填写邮箱和密码')
        setLoading(false)
        return
      }
    }

    const maxRetries = 3
    let retryCount = 0

    const tryLogin = async (): Promise<boolean> => {
      try {
        const response = await fetch(`/api/auth/${mode}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password,
            name,
            code: verifyCode
          })
        })

        const data = await response.json()
        
        if (response.status === 400) {
          setError(data.message)
          return false
        }

        if (data.success) {
          setToast({ message: `${mode === 'login' ? '登录' : '注册'}成功`, type: 'success' })
          if (data.apiKey) {
            localStorage.setItem('authToken', data.apiKey.token)
            setAuthState({
              isAuthenticated: true,
              remainingCalls: data.apiKey.remainingCalls,
              plan: data.apiKey.plan,
              expiresAt: data.apiKey.expiresAt
            })
          }
          onOpenChange(false)
          window.location.reload()
          return true
        } else {
          setError(data.message)
          setToast({ message: data.message, type: 'error' })
          return false
        }
      } catch {
        if (retryCount < maxRetries) {
          retryCount++
          await new Promise(resolve => setTimeout(resolve, 1000))
          return tryLogin()
        }
        const errorMessage = '请求失败，请重试'
        setError(errorMessage)
        setToast({ message: errorMessage, type: 'error' })
        return false
      }
    }

    try {
      await tryLogin()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? '登录' : '注册'}</DialogTitle>
          {error && (
            <div className="text-sm text-red-500 mt-2">
              {error}
            </div>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {mode === 'register' && (
            <>
              <Input
                type="text"
                placeholder="昵称"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="验证码"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={sendingCode || countdown > 0}
                  className="whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
                </Button>
              </div>
            </>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </Button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setVerifyCode("")
              setCountdown(0)
            }}
            className="text-sm text-muted-foreground hover:text-primary w-full text-center"
          >
            {mode === 'login' ? '没有账号？点击注册' : '已有账号？点击登录'}
          </button>
        </form>
      </DialogContent>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Dialog>
  )
} 