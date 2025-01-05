"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import '@/styles/progress.css'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "h-2 bg-black/10 rounded-full overflow-hidden",
          className
        )}
        {...props}
      >
        <div
          className="progress-bar"
          data-value={value || 0}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress } 