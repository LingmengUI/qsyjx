"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface VideoPlayerProps {
  src: string
  title?: string
  className?: string
}

export function VideoPlayer({ src, title, className }: VideoPlayerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)

  const proxyUrl = `/api/video-proxy?url=${encodeURIComponent(src)}`

  const handlePlay = async () => {
    try {
      setLoading(true)
      setPlaying(true)
      if (videoRef.current) {
        await videoRef.current.play()
      }
    } catch {
      setError(true)
      setErrorMessage("视频播放失败，请尝试直接下载查看")
      setPlaying(false)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-md text-center px-4">
          <div className="text-muted-foreground space-y-2">
            <p className="text-base font-medium">视频加载失败</p>
            <p className="text-sm">请尝试直接下载查看</p>
            {errorMessage && (
              <p className="text-xs text-red-500">{errorMessage}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        {!playing ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/5 dark:bg-white/5">
            <div className="text-center text-muted-foreground">
              <p className="text-base">{title || "视频已就绪"}</p>
              <p className="text-sm mt-2">点击播放按钮开始预览</p>
            </div>
            <Button
              onClick={handlePlay}
              className="bg-violet-500 hover:bg-violet-600"
              disabled={loading}
            >
              {loading ? "加载中..." : "播放视频"}
            </Button>
          </div>
        ) : (
          <div className="w-full h-full">
            <video
              ref={videoRef}
              className={cn("w-full h-full object-contain", className)}
              controls
              playsInline
              controlsList="nodownload"
              onLoadStart={() => setLoading(true)}
              onCanPlay={() => setLoading(false)}
              onError={() => {
                setError(true)
                setErrorMessage("视频加载失败，请尝试直接下载查看")
                setLoading(false)
                setPlaying(false)
              }}
              preload="metadata"
              src={proxyUrl}
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        )}

        {loading && playing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/5 dark:bg-white/5">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
            <div className="text-sm text-muted-foreground">视频加载中...</div>
          </div>
        )}
      </div>
    </div>
  )
} 