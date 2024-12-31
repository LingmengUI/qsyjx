"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { useState, useEffect } from "react"
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

export default function Home() {
  const [url, setUrl] = useState("")
  const [currentAlgorithm, setCurrentAlgorithm] = useState("algorithm2")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultType>({})
  const [activeTab, setActiveTab] = useState<TabType>('video')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // 替换所有的 alert 调用
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

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
    if (!_0x2c1a() || !verifyIntegrity()) {
      document.body.innerHTML = '';
      throw new Error('System integrity compromised');
    }
    if (!url.trim()) {
      showToast("请输入视频链接", "error")
      return
    }

    // 提取URL的正则表达式
    const urlRegex = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|:|#!|!!|#\/?|-)+)/g
    const matches = url.match(urlRegex)
    
    if (!matches) {
      showToast("请输入有效的视频链接", "error")
      return
    }

    setLoading(true)
    try {
      let processedResult: ResultType = {}

      switch (currentAlgorithm) {
        case "algorithm1":
          try {
            const proxyResponse = await fetch('/api/proxy1', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url: url.trim() }),
            })

            const data1 = await proxyResponse.json()
            
            if (data1.success) {
              const videoUrl = data1.data.download_url || data1.data.video_url
              const imageUrl = data1.data.image_url
              const title = data1.data.video_title
              
              processedResult = {
                videoUrl: videoUrl || null,
                coverUrl: imageUrl || null,
                title: title || '',
                images: []
              }

              if (!processedResult.videoUrl && !processedResult.coverUrl) {
                throw new Error("未找到有效的视频或图片链接")
              }

              if (processedResult.coverUrl) {
                processedResult.images = [processedResult.coverUrl]
              }
            } else {
              throw new Error(data1.msg || "解析失败")
            }
          } catch (error) {
            throw error
          }
          break

        case "algorithm2":
          try {
            const proxyResponse = await fetch('/api/proxy2', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url: url.trim() }),
            })

            const data2 = await proxyResponse.json()

            if (data2.code === 0) {
              const videoUrl = data2.data.video_url || data2.data.url || data2.data.download_url

              if (videoUrl) {
                processedResult = {
                  title: data2.data.title,
                  videoUrl: videoUrl.replace(/&amp;/g, '&'),
                  coverUrl: data2.data.cover_url?.replace(/&amp;/g, '&'),
                }
              }
              else if (data2.data.type === "2" || data2.data.pics?.length > 0) {
                let images: string[] = []
                
                if (Array.isArray(data2.data.pics)) {
                  images = data2.data.pics.map((url: string) => url.replace(/&amp;/g, '&'))
                } 
                else if (typeof data2.data.pics === 'string') {
                  try {
                    const decodedPics = data2.data.pics
                      .replace(/&quot;/g, '"')
                      .replace(/&amp;/g, '&')
                      .replace(/\\\//g, '/')
                      .replace(/\\/g, '')

                    const parsedImages = JSON.parse(decodedPics)
                    if (Array.isArray(parsedImages)) {
                      images = parsedImages.map((url: string) => url.replace(/&amp;/g, '&'))
                    }
                  } catch {
                    // 静默处理错误
                  }
                }

                processedResult = {
                  title: data2.data.title,
                  images: images,
                  coverUrl: data2.data.cover_url?.replace(/&amp;/g, '&'),
                }

                if ((!images || images.length === 0) && data2.data.cover_url) {
                  processedResult.images = [data2.data.cover_url.replace(/&amp;/g, '&')]
                }

                if (!processedResult.images || processedResult.images.length === 0) {
                  throw new Error("未找到有效的图片内容")
                }

                setActiveTab('gallery')
              } else {
                throw new Error("未找到有效的视频或图片内容")
              }
            } else {
              throw new Error(data2.msg || "解析失败")
            }
          } catch (error) {
            throw error
          }
          break

        case "algorithm3":
          try {
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

      // 设置结果
      setResultAndTab(processedResult)
      showToast("解析成功", "success")
    } catch (error) {
      console.error("解析失败:", error)
      // 显示友好的错误信息
      showToast(error instanceof Error ? error.message : "解析失败，请稍后重试", "error")
      // 清空结果
      setResult({})
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

  return (
    <div className="relative min-h-screen">
      {/* 侧边栏 - 修改为响应式 */}
      <aside className={cn(
        "fixed left-0 top-0 z-30 h-full w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "lg:translate-x-0 transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo 区域 - 添加关闭按钮 */}
          <div className="flex h-20 items-center justify-between border-b px-6">
            {/* Logo 和标题区域 */}
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 animate-pulse blur-xl opacity-50" />
                <div className="relative h-full w-full rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 p-[2px]">
                  <div className="h-full w-full rounded-xl bg-background flex items-center justify-center">
                    <svg className="h-6 w-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight">视频解析工具</h1>
                <p className="text-sm text-muted-foreground">去水印下载神器</p>
              </div>
            </div>

            {/* 移动端关闭按钮 */}
            <button
              className="lg:hidden p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="关闭菜单"
              title="关闭菜单"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>

          {/* 主要内容区域 */}
          <div className="flex-1 overflow-auto px-6 py-8">
            {/* 算法选择区域 */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold tracking-tight">解析算法</h2>
                <p className="text-sm text-muted-foreground">选择最适合的算法来解析视频</p>
              </div>

              <div className="space-y-4">
                {algorithms.map(({ id, label, icon, desc, bgColor, shadowColor }) => (
                  <button
                    key={id}
                    onClick={() => setCurrentAlgorithm(id)}
                    className={cn(
                      "group relative w-full rounded-2xl p-4 text-left transition-all duration-300",
                      currentAlgorithm === id 
                        ? `bg-gradient-to-br ${bgColor} text-white shadow-lg ${shadowColor}` 
                        : 'hover:bg-gradient-to-br hover:from-violet-500/5 hover:to-indigo-500/5'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        currentAlgorithm === id 
                          ? "bg-white/20" 
                          : "bg-violet-100 dark:bg-violet-900/20 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/30"
                      )}>
                        {icon}
                      </div>
                      <div>
                        <div className="font-semibold">{label}</div>
                        <div className={cn(
                          "text-sm transition-colors",
                          currentAlgorithm === id 
                            ? "text-white/70" 
                            : "text-gray-500 dark:text-gray-400"
                        )}>
                          {desc}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 底部区域 */}
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* 添加开发者信息 */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{_0x1f3a(_0x4e8d[0])}</p>
                  <p className="text-sm text-muted-foreground" data-dev-id>{_0x3e9b}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <svg className="h-4 w-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 主题设置部分 */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
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
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 主内容区域 - 修改为响应式 */}
      <div className="lg:pl-80">
        <main className="min-h-screen">
          {/* 顶部区域 */}
          <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container h-20 flex items-center gap-4">
              {/* 移动端汉堡菜单按钮 */}
              <button
                className="lg:hidden p-2 hover:bg-accent rounded-md"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="打开菜单"
                title="打开菜单"
              >
                <svg 
                  className="h-6 w-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
              </button>

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
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>解析中</span>
                    </div>
                  ) : (
                    "开始解析"
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
            <div className="container border-t py-3 overflow-auto">
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
                  <div className="group relative">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground/80 hover:text-foreground transition-colors cursor-help">
                      <RiMoreFill className="w-4 h-4" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-popover rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap text-sm">
                      全平台支持
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="container py-8 px-4 sm:px-8 h-full overflow-y-auto pb-32 lg:pb-8">
            <div className="grid grid-cols-1 gap-8">
              {/* 预览卡片 */}
              <Card className="overflow-hidden border-0 bg-white/50 shadow-xl dark:bg-gray-900/50 backdrop-blur-xl">
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
                              onClick={() => result.videoUrl && copyToClipboard(result.videoUrl)}
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
                              onClick={() => result.coverUrl && copyToClipboard(result.coverUrl)}
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
                              onClick={() => result.audioUrl && copyToClipboard(result.audioUrl)}
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
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* 移动端底部输入区域 */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 space-y-3">
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
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>解析中</span>
                  </div>
                ) : (
                  "开始解析"
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
        </main>
      </div>
      
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

