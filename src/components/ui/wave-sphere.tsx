"use client"

import { useEffect, useRef, useCallback } from 'react'
import { cn } from "@/lib/utils"
import '@/styles/wave-sphere.css'

// 将颜色转换函数移到组件外部
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0]
}

interface WaveSphereProps {
  value: number
  size?: number | string
  color?: string
  label?: string
}

export function WaveSphere({ 
  value, 
  size = 200,
  color = "#8B5CF6",
  label
}: WaveSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 使用 useCallback 记忆颜色转换函数
  const withOpacity = useCallback((color: string, opacity: number) => {
    const [r, g, b] = hexToRgb(color)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }, [])

  // 计算实际使用的尺寸
  const actualSize = typeof size === 'number' ? size : 200

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const draw = () => {
      time += 0.05
      ctx.clearRect(0, 0, actualSize, actualSize)

      // 绘制外圆
      ctx.beginPath()
      ctx.arc(actualSize/2, actualSize/2, actualSize/2 - 2, 0, Math.PI * 2)
      ctx.strokeStyle = withOpacity(color, 0.2)  // 20% 透明度
      ctx.lineWidth = 2
      ctx.stroke()

      // 绘制波浪
      const waveHeight = actualSize * (1 - value/100)
      ctx.beginPath()
      ctx.moveTo(0, actualSize)

      for (let x = 0; x <= actualSize; x++) {
        const y = waveHeight + Math.sin(x/30 + time) * 5 + 
                 Math.sin(x/15 + time * 0.8) * 3
        ctx.lineTo(x, y)
      }

      ctx.lineTo(actualSize, actualSize)
      ctx.closePath()
      
      // 创建渐变
      const gradient = ctx.createLinearGradient(
        actualSize/2, 0, actualSize/2, actualSize
      )
      gradient.addColorStop(0, withOpacity(color, 0.4))  // 40% 透明度
      gradient.addColorStop(1, withOpacity(color, 0.2))  // 20% 透明度
      
      ctx.fillStyle = gradient
      ctx.fill()

      // 绘制光晕效果
      const glowGradient = ctx.createRadialGradient(
        actualSize/2, actualSize/2, 0,
        actualSize/2, actualSize/2, actualSize/2
      )
      glowGradient.addColorStop(0, withOpacity(color, 0))    // 0% 透明度
      glowGradient.addColorStop(0.8, withOpacity(color, 0.067))  // 6.7% 透明度
      glowGradient.addColorStop(1, withOpacity(color, 0.133))    // 13.3% 透明度

      ctx.fillStyle = glowGradient
      ctx.fill()

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [actualSize, value, color, withOpacity])

  return (
    <div 
      className={cn(
        "wave-sphere-container",
        typeof size === 'string' ? 'w-full h-full' : `w-[${size}px] h-[${size}px]`
      )}
      data-sphere-color={color}
    >
      <canvas
        ref={canvasRef}
        width={actualSize}
        height={actualSize}
        className="wave-sphere-canvas w-full h-full"
      />
      {label && (
        <div className="wave-sphere-content">
          <div className="wave-sphere-value">
            {value}%
          </div>
          <div className="wave-sphere-label">
            {label}
          </div>
        </div>
      )}
    </div>
  )
} 