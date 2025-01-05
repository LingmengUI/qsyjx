import { Skeleton } from "@/components/ui/skeleton"

export function PageSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-[120px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg" />
      </div>
    </>
  )
} 