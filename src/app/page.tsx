"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { useState, useEffect, useCallback } from "react"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { VideoPlayer } from "@/components/ui/video-player"
import { 
  SiTiktok, 
  SiXiaohongshu, 
  SiBilibili, 
  SiKuaishou,
} from "react-icons/si"
import {
  RiVideoFill,
  RiFireFill,
  RiMoreFill,
  RiWeiboFill,
} from "react-icons/ri"
import {
  TbBrandXbox,
} from "react-icons/tb"
import { Toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { LoginDialog } from "@/components/login-dialog"
import { UserNav } from "@/components/user-nav"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Menu } from "lucide-react"
import { Loader2, Wand2 } from "lucide-react"

type TabType = 'video' | 'cover' | 'audio' | 'gallery';

type ResultType = {
  videoUrl?: string | null
  coverUrl?: string | null
  audioUrl?: string | null
  title?: string
  images?: string[]
}

const _0x4e8d = [
  btoa(String.fromCharCode(229, 188, 128, 229, 143, 145, 232, 128, 133)),
  btoa(String.fromCharCode(231, 129, 181, 230, 162, 166))
];

const _0x2c1a = () => {
  try {
    if (!_0x4e8d || _0x4e8d.length !== 2) {
      return false;
    }
    
    const expectedLength1 = btoa(String.fromCharCode(229, 188, 128, 229, 143, 145, 232, 128, 133)).length;
    const expectedLength2 = btoa(String.fromCharCode(231, 129, 181, 230, 162, 166)).length;
    
    if (_0x4e8d[0].length !== expectedLength1 || _0x4e8d[1].length !== expectedLength2) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

const _0x1f3a = (s: string) => {
  try {
    return decodeURIComponent(escape(atob(s)))
  } catch {
    throw new Error("Critical system error")
  }
}

const _0x3e9b = _0x1f3a(_0x4e8d[1]);

const verifyIntegrity = () => {
  try {
    const devElement = document.querySelector('[data-dev-id]')
    if (!devElement) throw new Error("System integrity compromised")
    
    const content = devElement.textContent
    if (!content) throw new Error("System integrity compromised")
    
    if (content !== _0x1f3a(_0x4e8d[1])) {
      
      setTimeout(() => {
        throw new Error("Critical system failure")
      }, Math.random() * 1000)
      return false
    }

    
    const observer = new MutationObserver(() => {
      
      throw new Error("System integrity violation detected")
    })

    
    observer.observe(devElement, {
      characterData: true,
      childList: true,
      subtree: true,
      attributes: true
    })

    return true
  } catch {
    
    setTimeout(() => {
      while (true) {
        
        document.body.innerHTML = ""
      }
    }, Math.random() * 2000)
    return false
  }
}

// 添加回 AuthState 类型
type AuthState = {
  isAuthenticated: boolean;
  remainingCalls: number;
  expiresAt?: string;
  plan?: 'basic' | 'pro' | 'enterprise';
}

// 添加计划类型映射
const PLAN_NAMES = {
  'basic': '标准版 - 基础API访问',
  'pro': '专业版 - 高级功能+优先支持',
  'enterprise': '企业版 - 定制功能+专属支持'
} as const

export default function Home() {
  const [url, setUrl] = useState("")
  const [currentAlgorithm, setCurrentAlgorithm] = useState("algorithm2")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultType>({})
  const [activeTab, setActiveTab] = useState<TabType>('video')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    remainingCalls: 0
  })
  const [authToken, setAuthToken] = useState("")
  const [user, setUser] = useState<{
    id: number
    email: string
    name: string
    avatar: string
    role: 'admin' | 'user'
  } | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [settings, setSettings] = useState({
    tutorial: '',
    faq: '',
    contact_email: '',
    announcement: ''
  })
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)

  // 在设置结果之前添加自动切换逻辑
  const setResultAndTab = (result: ResultType) => {
    setResult(result)
    
    // 自动切换到合适的预览标签
    if (result.videoUrl) {
      setActiveTab('video')
    } else if (result.images?.length) {
      setActiveTab('gallery')
    } else if (result.coverUrl) {
      setActiveTab('cover')
    } else if (result.audioUrl) {
      setActiveTab('audio')
    }
  }

  const handleAnalyze = async () => {
    if (!url) {
      setToast({ message: '请输入视频链接', type: 'error' })
      return
    }

    // 提取URL的正则表达式
    const urlRegex = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|:|#!|!!|#\/?|-)+)/g
    const matches = url.match(urlRegex)
    
    if (!matches) {
      setToast({ message: "请输入有效的视频链接", type: 'error' })
      return
    }

    // 检查是否需要验证
    if (!user || !authState.isAuthenticated) {
      setToast({ message: '请先登录并验证 API Token', type: 'error' })
      setLoginOpen(true)
      return
    }

    setLoading(true)
    try {
      // 解析视频
      let processedResult: ResultType = {}
      
      switch (currentAlgorithm) {
        case "algorithm2":
          try {
            const proxyResponse = await fetch('/api/proxy2', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(user && authState.isAuthenticated ? {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                } : {})
              },
              body: JSON.stringify({ 
                url: url.trim(),
                useFreeTier: false
              }),
            })

            if (!proxyResponse.ok) {
              const errorData = await proxyResponse.json()
              setToast({ 
                message: errorData.message || '解析失败',
                type: 'error'
              })
              return
            }

            const data2 = await proxyResponse.json()

            if (data2.code === 0) {
              const videoUrl = data2.data.video_url || data2.data.url || data2.data.download_url

              if (videoUrl) {
                processedResult = {
                  title: data2.data.title || data2.data.video_title,
                  videoUrl: videoUrl.replace(/&amp;/g, '&'),
                  coverUrl: data2.data.cover_url?.replace(/&amp;/g, '&'),
                }
              } else if (data2.data.type === "2" || data2.data.pics?.length > 0 || data2.data.image_url) {
                let images: string[] = []
                
                if (Array.isArray(data2.data.pics)) {
                  images = data2.data.pics.map((url: string) => url.replace(/&amp;/g, '&'))
                } 

                processedResult = {
                  title: data2.data.title || data2.data.video_title,
                  images: images,
                  coverUrl: data2.data.cover_url?.replace(/&amp;/g, '&'),
                }

                if (!images || images.length === 0) {
                  if (data2.data.image_url) {
                    processedResult.images = [data2.data.image_url.replace(/&amp;/g, '&')]
                  } else if (data2.data.cover_url) {
                    processedResult.images = [data2.data.cover_url.replace(/&amp;/g, '&')]
                  }
                }

                if (!processedResult.images || processedResult.images.length === 0) {
                  throw new Error("未找到有效的图片内容")
                }

                setActiveTab('gallery')
              } else {
                throw new Error("未找到有效的视频或图片内容")
              }
            } else {
              setToast({ 
                message: data2.msg || "解析失败",
                type: 'error'
              })
              return
            }
          } catch (error) {
            console.error('Algorithm2 error:', error)
            setToast({ 
              message: error instanceof Error ? error.message : '解析失败，请稍后重试',
              type: 'error'
            })
            return
          }
          break

        case "algorithm3":
          try {
            // 检查是否是抖音链接
            if (!url.includes('douyin.com') && !url.includes('tiktok.com')) {
              setToast({ 
                message: "当前解析通道仅支持抖音视频", 
                type: 'info'  // 使用 info 类型显示黄色警告
              })
              return
            }

            const proxyResponse = await fetch('/api/proxy3', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url: matches[0] }),
            })

            const data3 = await proxyResponse.json()
            
            if (!data3 || typeof data3 !== 'object') {
              throw new Error("API 返回格式错误")
            }

            if (data3.code === 404 || data3.status === 404) {
              throw new Error(data3.msg || "解析失败，请检查链接是否正确")
            }

            if (!data3.data || typeof data3.data !== 'object') {
              throw new Error("返回数据格式错误")
            }

            try {
              processedResult = {
                title: data3.data.title || '',
                videoUrl: data3.data.url || null,
                coverUrl: data3.data.cover || null,
                audioUrl: data3.data.music || null,
                images: Array.isArray(data3.data.images) ? data3.data.images : []
              }

              if (!processedResult.images?.length && processedResult.coverUrl) {
                processedResult.images = [processedResult.coverUrl]
              }

              const hasContent = processedResult.videoUrl || 
                                processedResult.images?.length || 
                                processedResult.coverUrl

              if (!hasContent) {
                throw new Error("未找到有效的内容")
              }

            } catch (error) {
              throw new Error(`数据处理失败: ${error instanceof Error ? error.message : '未知错误'}`)
            }
          } catch (error) {
            throw error
          }
          break

        case "algorithm4":
          try {
            const apiUrl4 = `${process.env.NEXT_PUBLIC_API_URL_3}?apikey=${process.env.NEXT_PUBLIC_API_KEY_2}&url=${encodeURIComponent(url)}`
            const response = await fetch(apiUrl4)
            const data4 = await response.json()

            if (!data4) {
              throw new Error("API返回数据为空")
            }

            if (data4.code !== 200) {
              throw new Error(data4.msg || "解析失败")
            }

            if (!data4.data) {
              throw new Error("返回数据格式错误")
            }

            if (data4.data.type === 2 || data4.data.type === "2") {  // 图集，支持数字和字符串类型
              let images = []
              try {
                if (Array.isArray(data4.data.pics)) {
                  images = data4.data.pics
                } else if (typeof data4.data.pics === 'string') {
                  const parsedImages = JSON.parse(data4.data.pics)
                  if (Array.isArray(parsedImages)) {
                    images = parsedImages
                  }
                }
              } catch {
                // 静默处理错误
              }

              processedResult = {
                title: data4.data.title,
                images: images,
                coverUrl: data4.data.cover_url,
              }

              if ((!images || images.length === 0) && data4.data.cover_url) {
                processedResult.images = [data4.data.cover_url]
              }

              if (!processedResult.images || processedResult.images.length === 0) {
                throw new Error("未找到有效的图片内容")
              }

              setActiveTab('gallery')
            } else if (data4.data.type === 1 || data4.data.type === "1" || !data4.data.type) {  // 视频或默认情况
              if (!data4.data.video_url) {
                throw new Error("未找到有效的视频链接")
              }

              processedResult = {
                title: data4.data.title,
                videoUrl: data4.data.video_url,
                coverUrl: data4.data.cover_url,
              }
            }
          } catch (error) {
            throw error
          }
          break
      }

      // 解析成功后，更新使用次数
      if (authState.isAuthenticated) {
        const response = await fetch('/api/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url,
            apiKey: localStorage.getItem('authToken'),
            algorithm: currentAlgorithm
          })
        })

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || '解析失败')
        }

        if (data.success && data.quota) {
          setAuthState(prev => ({
            ...prev,
            remainingCalls: data.quota.remaining
          }))
        }
      }

      // 设置解析结果
      setResultAndTab(processedResult)
      
      // 修改成功提示
      if (processedResult.videoUrl) {
        setToast({ message: "视频解析成功", type: 'success' })
      } else if (processedResult.images?.length) {
        setToast({ message: "图集解析成功", type: 'success' })
      } else {
        setToast({ message: "解析成功", type: 'success' })
      }

    } catch (error) {
      console.error('Analysis error:', error)
      setToast({ 
        message: error instanceof Error ? error.message : '解析失败，请稍后重试', 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setUrl("")
    setResult({})
    setActiveTab('video')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert("复制成功")
    } catch {
      alert("复制失败，请手动复制")
    }
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      setLoading(true)
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = blobUrl
      a.download = filename
      
      document.body.appendChild(a)
      a.click()
      
      // 清理
      window.URL.revokeObjectURL(blobUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error("下载失败:", error)
      alert("下载失败，请手动下载或稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const getPreviewContent = () => {
    if (!result.videoUrl && !result.coverUrl && !result.audioUrl) {
  return (
        <div className="h-full flex items-center justify-center">
          <div className="text-gray-500">
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500" />
                <span>解析中...</span>
              </div>
            ) : (
              "等待解析..."
            )}
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'video':
        return result.videoUrl ? (
          <div className="h-full">
            <VideoPlayer
              src={result.videoUrl}
              title={result.title}
            />
          </div>
        ) : null;

      case 'cover':
        return result.coverUrl ? (
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full cover-container">
                <ImageWithFallback
                  src={result.coverUrl}
                  alt="视频封面"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        ) : null;

      case 'audio':
        return result.audioUrl ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-4">
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <svg className="h-12 w-12 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              </div>
              <audio controls className="w-full">
                <source src={result.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          </div>
        ) : null;

      case 'gallery':
        return result.images?.length ? (
          <div className="h-full overflow-auto scrollbar-hide p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {result.images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <ImageWithFallback
                    src={img}
                    alt={`图集图片 ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/40 text-white font-medium"
                      onClick={() => copyToClipboard(img)}
                    >
                      复制链接
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/40 text-white font-medium"
                      onClick={() => downloadFile(img, `gallery_${index + 1}.jpg`)}
                    >
                      下载
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;
    }
  }

  // 更新算法配置数组
  const algorithms = [
    { 
      id: "algorithm2", 
      label: "通用解析1", 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      desc: "优化各平台",
      bgColor: "from-pink-500 to-rose-500",
      shadowColor: "shadow-pink-500/25"
    },
    { 
      id: "algorithm3", 
      label: "抖音专属", 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      desc: "仅支持抖音",
      bgColor: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/25"
    },
    { 
      id: "algorithm4", 
      label: "通用解析2", 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      desc: "支持多个平台",
      bgColor: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/25"
    },
  ]

  // 在组件挂载时进行校验
  useEffect(() => {
    // 延迟执行校验，等待 DOM 完全加载
    const timer = setTimeout(() => {
      if (!_0x2c1a()) {
        document.body.innerHTML = '';
        throw new Error('Critical initialization error');
      }
      
      if (!verifyIntegrity()) {
        setTimeout(() => {
          throw new Error("Application initialization failed");
        }, Math.random() * 3000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('authToken', token)
        setAuthState({
          isAuthenticated: true,
          remainingCalls: data.data.remainingCalls,
          plan: data.data.plan,
          expiresAt: data.data.expiresAt
        })
        setToast({ message: '验证成功', type: 'success' })
      } else {
        setToast({ message: data.message || '验证失败', type: 'error' })
      }
    } catch {
      setToast({ message: '验证失败，请稍后重试', type: 'error' })
    }
  }

  // 获取用户信息
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Get user error:', error)
        setUser(null)
      }
    }

    void checkUser()
  }, []) // 添加空依赖数组

  // 处理登录状态变化
  const handleAuthChange = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Get user error:', error)
      setUser(null)
    }
  }, [])

  // 获取系统设置
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        if (data.success) {
          setSettings(data.settings)
        }
      } catch (error) {
        console.error('获取系统设置失败:', error)
      }
    }

    fetchSettings()
  }, [])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setToast({ message: "复制成功", type: 'success' })
    } catch (error) {
      setToast({ 
        message: error instanceof Error ? 
          `复制失败: ${error.message}` : 
          "复制失败", 
        type: 'error' 
      })
    }
  }

  // 添加用户状态初始化的 effect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        
        if (data.success) {
          setUser(data.user)
          // 如果用户有 API Token，自动验证
          if (data.apiKey) {
            localStorage.setItem('authToken', data.apiKey.token)
            setAuthState({
              isAuthenticated: true,
              remainingCalls: data.apiKey.remainingCalls,
              plan: data.apiKey.plan,
              expiresAt: data.apiKey.expiresAt
            })
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }

    void checkAuth()
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 侧边栏 */}
      <aside className={cn(
        "fixed inset-y-0 left-0 border-r bg-background transition-transform duration-300",
        "w-[70vw] lg:w-80",
        "lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "z-40"
      )}>
        {/* 添加侧边栏切换按钮 - 只在移动端显示 */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            // 基础样式
            "lg:hidden absolute -right-6 top-1/2 -translate-y-1/2",
            "h-16 w-6 flex items-center justify-center",
            "bg-background border",
            
            isSidebarOpen 
              ? "border-l-0 rounded-r-md" 
              : "border-r-0 rounded-l-md", 
            // 动画效果
            "transition-transform duration-300",
            // 根据侧边栏状态旋转箭头
            isSidebarOpen ? "rotate-0" : "rotate-180"
          )}
          aria-label={isSidebarOpen ? "关闭菜单" : "打开菜单"}
        >
          <svg 
            className="w-3 h-3 text-violet-500"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex h-full flex-col">
          {/* 顶部标题区域 */}
          <div className="h-20 px-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 p-[2px]">
                <div className="h-full w-full rounded-xl bg-background flex items-center justify-center">
                  <svg className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold">视频解析工具</h1>
                <p className="text-sm text-muted-foreground">支持多平台视频解析</p>
              </div>
            </div>
            
            {/* 只在桌面端显示用户头像 */}
            <div className="hidden lg:block">
              {user ? (
                <UserNav user={user} onAuthChange={handleAuthChange} />
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setLoginOpen(true)}
                  className="ml-auto"
                >
                  登录
                </Button>
              )}
            </div>
          </div>

          {/* 解析通道区域 - 添加 scrollbar-hide */}
          <div className="flex-1 overflow-auto px-6 scrollbar-hide relative z-0">
            {/* 解析通道 */}
            <div className="py-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-6">解析通道</h2>
              <div className="space-y-4">
                {algorithms.map(algorithm => (
                  <button
                    key={algorithm.id}
                    onClick={() => setCurrentAlgorithm(algorithm.id)}
                    className={cn(
                      "w-full relative flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                      "hover:shadow-lg hover:-translate-y-0.5",
                      currentAlgorithm === algorithm.id ? 
                        `bg-gradient-to-r ${algorithm.bgColor} text-white ${algorithm.shadowColor}` : 
                        "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {algorithm.icon}
                    <div className="flex-1 flex flex-col items-start">
                      <span className="text-sm font-medium leading-none">
                        {algorithm.label}
                      </span>
                      <span className={cn(
                        "text-xs mt-1",
                        currentAlgorithm === algorithm.id ? "text-white/80" : "text-muted-foreground"
                      )}>
                        {algorithm.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 快捷功能区域 */}
            <div className="py-6 border-t">
              <h2 className="text-sm font-medium text-muted-foreground mb-6">快捷功能</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => setTutorialOpen(true)}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-sm"
                >
                  <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>使用教程</span>
                </button>
                <button 
                  onClick={() => setFaqOpen(true)}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-sm"
                >
                  <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>常见问题</span>
                </button>
                <a 
                  href={`mailto:${settings.contact_email}`}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-sm"
                >
                  <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>联系我们</span>
                </a>
              </div>
            </div>
          </div>

          {/* 底部信息区域 */}
          <div className="border-t mt-auto">
            {/* API 鉴权区域 */}
            <div className="p-6 border-b">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">API 鉴权</h2>
              {authState.isAuthenticated ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10">
                    <div className="flex items-center gap-2 text-green-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">已验证</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">剩余次数：{authState.remainingCalls}</div>
                      {authState.plan && (
                        <div className="text-sm">
                          当前套餐：{authState.plan in PLAN_NAMES ? 
                            PLAN_NAMES[authState.plan as keyof typeof PLAN_NAMES] : 
                            authState.plan
                          }
                        </div>
                      )}
                      {authState.expiresAt && (
                        <div className="text-sm">过期时间：{new Date(authState.expiresAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('authToken')
                      setAuthState({ isAuthenticated: false, remainingCalls: 0 })
                      setAuthToken("")
                    }}
                    className="w-full p-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    退出鉴权
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="请输入 API Token"
                    type="password"
                    className="text-sm"
                  />
                  <Button
                    onClick={() => verifyToken(authToken)}
                    className="w-full bg-violet-500 hover:bg-violet-600"
                  >
                    验证
                  </Button>
                </div>
              )}
            </div>

            {/* 开发者信息 */}
            <div className="p-6 border-b">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{_0x1f3a(_0x4e8d[0])}</p>
                  <p className="text-sm text-muted-foreground" data-dev-id>{_0x3e9b}</p>
                </div>
              </div>
            </div>

            {/* 主题切换 */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">主题设置</p>
                  <p className="text-xs text-muted-foreground">切换深色/浅色模式</p>
                </div>
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 移动端遮罩层 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 主内容区域 */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        "lg:pl-80",
        "overflow-hidden"
      )}>
        {/* 顶部区域 */}
        <div className="sticky top-0 z-20 w-full border-b bg-background">
          {/* 输入框容器 */}
          <div className="container h-20 flex items-center gap-4">
            {/* 移动端汉堡菜单按钮 */}
            <button
              className="lg:hidden p-2 hover:bg-accent rounded-md"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="打开菜单"
              title="打开菜单"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* 移动端头像 - 只在移动端显示 */}
            <div className="lg:hidden ml-auto">
              {user ? (
                <UserNav user={user} onAuthChange={handleAuthChange} />
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setLoginOpen(true)}
                >
                  登录
                </Button>
              )}
            </div>

            {/* 输入区域 - 桌面端显示，移动端隐藏 */}
            <div className="hidden lg:flex items-center gap-3 w-full">
              <Input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="请粘贴视频分享链接..." 
                className="h-[44px] text-base rounded-full bg-background/50 border-violet-500/20 focus-visible:ring-violet-500/50 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              />
              <Button 
                size="lg" 
                className="min-w-[120px] h-[44px] rounded-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25 transition-all duration-300"
                onClick={handleAnalyze}
                disabled={loading || !url}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    解析中...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    开始解析
                  </>
                )}
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={handleClear}
                disabled={loading}
                className="min-w-[100px] h-[44px] rounded-full border-violet-500/20 hover:bg-violet-500/5 hover:text-violet-500 transition-all duration-300"
              >
                清空
              </Button>
            </div>
          </div>

          {/* 平台图标区域 */}
          <div className="w-full border-t relative">
            <div className="container py-3 lg:overflow-visible overflow-auto scrollbar-hide">
              <div className="flex items-center gap-6 min-w-max px-2">
                <div className="text-sm text-muted-foreground">支持平台：</div>
                <div className="flex items-center gap-4">
                  {[
                    { name: "抖音", icon: SiTiktok },
                    { name: "西瓜视频", icon: TbBrandXbox },
                    { name: "小红书", icon: SiXiaohongshu },
                    { name: "皮皮虾", icon: RiVideoFill },
                    { name: "哔哩哔哩", icon: SiBilibili },
                    { name: "微视", icon: RiVideoFill },
                    { name: "快手", icon: SiKuaishou },
                    { name: "火山", icon: RiFireFill },
                    { name: "微博", icon: RiWeiboFill },
                  ].map(({ name, icon: Icon }) => (
                    <div 
                      key={name}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground/80 hover:text-foreground transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{name}</span>
                    </div>
                  ))}
                  <div className="group relative tooltip-trigger">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground/80 hover:text-foreground transition-colors cursor-help">
                      <RiMoreFill className="w-4 h-4" />
                    </div>
                    <div className="tooltip">
                      全平台支持
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="container py-8 px-4 sm:px-8 h-[calc(100vh-8.5rem)] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 gap-8 pb-24 lg:pb-8">
            {/* 预览卡片 */}
            <Card className="overflow-hidden border-0 bg-white/50 shadow-xl dark:bg-gray-900/50">
              <div className="flex flex-col lg:flex-row">
                {/* 预览区域 - 响应式布局 */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {/* 标题区域 */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="hidden sm:block">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 p-[2px]">
                        <div className="h-full w-full rounded-xl bg-background flex items-center justify-center">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold">预览区域</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                        {result.title || "等待解析..."}
                      </p>
                    </div>
                  </div>

                  {/* 预览内容 - 调整高度和滚动 */}
                  <div className="aspect-video lg:aspect-auto lg:h-[600px] rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
                    {getPreviewContent()}
                  </div>

                  {/* 预览类型切换按钮 */}
                  <div className="mt-4 overflow-auto pb-2">
                    {/* 移动端两排布局，桌面端单排 */}
                    <div className={cn(
                      "grid gap-2",
                      "grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-row"
                    )}>
                      <Button 
                        variant={activeTab === 'video' ? 'default' : 'outline'}
                        className={cn(
                          "px-3 h-9 w-full lg:w-auto",
                          activeTab === 'video' ? 'bg-violet-500 hover:bg-violet-600' : ''
                        )}
                        onClick={() => setActiveTab('video')}
                        disabled={!result.videoUrl}
                      >
                        视频预览
                      </Button>
                      <Button 
                        variant={activeTab === 'cover' ? 'default' : 'outline'}
                        className={cn(
                          "px-3 h-9 w-full lg:w-auto",
                          activeTab === 'cover' ? 'bg-violet-500 hover:bg-violet-600' : ''
                        )}
                        onClick={() => setActiveTab('cover')}
                        disabled={!result.coverUrl}
                      >
                        封面预览
                      </Button>
                      <Button 
                        variant={activeTab === 'audio' ? 'default' : 'outline'}
                        className={cn(
                          "px-3 h-9 w-full lg:w-auto",
                          activeTab === 'audio' ? 'bg-violet-500 hover:bg-violet-600' : ''
                        )}
                        onClick={() => setActiveTab('audio')}
                        disabled={!result.audioUrl}
                      >
                        音频预览
                      </Button>
                      <Button 
                        variant={activeTab === 'gallery' ? 'default' : 'outline'}
                        className={cn(
                          "px-3 h-9 w-full lg:w-auto",
                          activeTab === 'gallery' ? 'bg-violet-500 hover:bg-violet-600' : ''
                        )}
                        onClick={() => setActiveTab('gallery')}
                        disabled={!result.images?.length}
                      >
                        图集预览
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 控制面板 */}
                <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l">
                  <div className="p-6">
                    <h4 className="font-medium text-sm text-muted-foreground mb-4">可用资源</h4>
                    <div className="space-y-4">
                      {/* 视频链接 */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">视频链接</div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-violet-500 hover:bg-violet-600"
                            onClick={() => handleCopy(result.videoUrl!)}
                            disabled={!result.videoUrl}
                          >
                            复制链接
                          </Button>
                          <Button 
                            className="flex-1" 
                            variant="outline"
                            onClick={() => result.videoUrl && downloadFile(result.videoUrl, `${result.title || 'video'}.mp4`)}
                            disabled={!result.videoUrl}
                          >
                            下载
                          </Button>
                        </div>
                      </div>

                      {/* 封面链接 */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">封面链接</div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-violet-500 hover:bg-violet-600"
                            onClick={() => handleCopy(result.coverUrl!)}
                            disabled={!result.coverUrl}
                          >
                            复制链接
                          </Button>
                          <Button 
                            className="flex-1" 
                            variant="outline"
                            onClick={() => result.coverUrl && downloadFile(result.coverUrl, `${result.title || 'cover'}.jpg`)}
                            disabled={!result.coverUrl}
                          >
                            下载
                          </Button>
                        </div>
                      </div>

                      {/* 音频链接 */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">音频链接</div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-violet-500 hover:bg-violet-600"
                            onClick={() => handleCopy(result.audioUrl!)}
                            disabled={!result.audioUrl}
                          >
                            复制链接
                          </Button>
                          <Button 
                            className="flex-1" 
                            variant="outline"
                            onClick={() => result.audioUrl && downloadFile(result.audioUrl, `${result.title || 'audio'}.mp3`)}
                            disabled={!result.audioUrl}
                          >
                            下载
                          </Button>
                        </div>
                      </div>

                      {/* 公告区域 */}
                      {settings.announcement && (
                        <div className="mt-6 border-t pt-4">
                          <div className="text-sm font-medium mb-2">系统公告</div>
                          <div 
                            className="h-24 overflow-y-auto text-sm text-muted-foreground prose prose-sm dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: settings.announcement }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 移动端底部输入区域 */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 space-y-3">
          <Input 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="请粘贴视频分享链接..." 
            className="h-[44px] text-base rounded-full bg-background/50 border-violet-500/20 focus-visible:ring-violet-500/50 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
          />
          <div className="flex gap-2">
            <Button 
              size="lg" 
              className="flex-1 h-[44px] rounded-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25 transition-all duration-300"
              onClick={handleAnalyze}
              disabled={loading || !url}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  解析中...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  开始解析
                </>
              )}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={handleClear}
              disabled={loading}
              className="h-[44px] rounded-full border-violet-500/20 hover:bg-violet-500/5 hover:text-violet-500 transition-all duration-300"
            >
              清空
            </Button>
          </div>
        </div>

        {/* 登录对话框 */}
        <LoginDialog 
          open={loginOpen} 
          onOpenChange={setLoginOpen}
          setAuthState={setAuthState}
        />

        {/* 使用教程对话框 */}
        <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
          <DialogContent className="max-w-[90%] w-full sm:max-w-lg max-h-[80vh] overflow-y-auto scrollbar-hide rounded-2xl">
            <DialogHeader>
              <DialogTitle>使用教程</DialogTitle>
            </DialogHeader>
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: settings.tutorial }}
            />
          </DialogContent>
        </Dialog>

        {/* 常见问题对话框 */}
        <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
          <DialogContent className="max-w-[90%] w-full sm:max-w-lg max-h-[80vh] overflow-y-auto scrollbar-hide rounded-2xl">
            <DialogHeader>
              <DialogTitle>常见问题</DialogTitle>
            </DialogHeader>
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: settings.faq }}
            />
          </DialogContent>
        </Dialog>
      </main>
      
      {/* Toast 组件 */}
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

