"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
}

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>图片加载失败</p>
          <p className="text-sm mt-2">请尝试直接下载查看</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div className={cn(
        "relative w-full h-full transition-opacity duration-300",
        loading ? "opacity-0" : "opacity-100"
      )}>
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt={alt}
            fill
            className={cn("object-contain", className)}
            onError={() => setError(true)}
            onLoadingComplete={() => setLoading(false)}
            referrerPolicy="no-referrer"
            priority
            unoptimized
            sizes="100vw"
          />
        </div>
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
        </div>
      )}
    </div>
  )
} 