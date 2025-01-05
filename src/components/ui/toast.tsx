"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export function Toast({ 
  message, 
  type = 'success',
  duration = 3000,
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-0 right-0 flex justify-center z-[100]">
      <div
        className={cn(
          "rounded-lg px-4 py-3 shadow-lg max-w-[90vw]",
          isLeaving 
            ? "animate-out fade-out slide-out-to-top duration-300" 
            : "animate-in fade-in slide-in-from-top duration-300",
          type === 'success' ? 'bg-green-50 text-green-600' : 
          type === 'error' ? 'bg-red-50 text-red-600' : 
          'bg-yellow-50 text-yellow-600'
        )}
      >
        <div className="flex items-center gap-3">
          {type === 'error' && (
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'success' && (
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'info' && (
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  )
} 