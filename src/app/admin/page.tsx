"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { WaveSphere } from "@/components/ui/wave-sphere"
import { 
  UserPlus2, Users, Key, Activity, 
  Zap, Globe2, Cpu, BarChart2
} from "lucide-react"
import { PageSkeleton } from "@/components/ui/page-skeleton"

interface Stats {
  totalUsers: number
  adminCount: number
  userCount: number
  totalApiKeys: number
  activeApiKeys: number
  todayRequests: number
  totalRequests: number
  totalQuota: number
  active_users_today: number
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
    totalApiKeys: 0,
    activeApiKeys: 0,
    todayRequests: 0,
    totalRequests: 0,
    totalQuota: 0,
    active_users_today: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        const data = await response.json()

        if (data.success) {
          setStats(data.stats)
        } else {
          setError(data.message)
        }
      } catch {
        setError('加载失败')
      } finally {
        setLoading(false)
      }
    }

    void fetchStats()
  }, [])

  if (loading) {
    return <PageSkeleton />
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="text-red-500">{error}</div>
      </Card>
    )
  }

  // 计算各种系统指标
  const calculatePercentages = () => {
    // 用户系统占比
    const userSystemPercentage = Math.round(
      (stats.totalUsers / (stats.totalUsers + stats.totalApiKeys || 1)) * 100
    )
    
    // API系统占比
    const apiSystemPercentage = Math.round(
      (stats.totalApiKeys / (stats.totalUsers + stats.totalApiKeys || 1)) * 100
    )

    // 系统负载 (基于活跃资源的比例)
    const systemLoadPercentage = Math.round(
      ((stats.activeApiKeys + stats.adminCount) / 
       (stats.totalApiKeys + stats.totalUsers || 1)) * 100
    )

    return {
      userSystemPercentage,
      apiSystemPercentage,
      systemLoadPercentage
    }
  }

  const { 
    userSystemPercentage, 
    apiSystemPercentage, 
    systemLoadPercentage 
  } = calculatePercentages()

  return (
    <div className="space-y-6">
      {/* 顶部标题区域 */}
      <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl border border-violet-200/20">
        <div className="p-4 bg-violet-500 rounded-2xl">
          <Globe2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">系统概览</h1>
          <p className="text-muted-foreground mt-1">实时监控与数据分析</p>
        </div>
      </div>

      {/* 主要数据展示区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：系统状态 */}
        <div className="space-y-8">
          {/* 系统活跃度 */}
          <Card className="p-8 bg-gradient-to-br from-violet-500 to-purple-600 text-white overflow-hidden relative min-h-[360px] h-auto">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">系统活跃度</h2>
                  <p className="text-sm text-white/60">实时系统性能监控</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-[180px] flex-shrink-0">
                  <WaveSphere 
                    value={systemLoadPercentage}
                    size={180}
                    color="#fff"
                    label="系统负载"
                  />
                </div>

                <div className="flex-grow w-full space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">用户系统</span>
                      <span className="text-white/60">{stats.totalUsers} 个用户</span>
                    </div>
                    <Progress value={userSystemPercentage} className="bg-white/20" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">API 系统</span>
                      <span className="text-white/60">{stats.totalApiKeys} 个密钥</span>
                    </div>
                    <Progress value={apiSystemPercentage} className="bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 用户和API密钥统计 */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-blue-600/80">总用户</div>
                  <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 rounded-xl">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-emerald-600/80">API 密钥</div>
                  <div className="text-2xl font-bold text-emerald-900">{stats.totalApiKeys}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 右侧：详细数据 */}
        <div className="space-y-8">
          {/* 系统指标卡片 */}
          <Card className="p-6 lg:p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200/20 min-h-[360px] h-[360px]">
            {/* 标题部分 - 减小手机端的间距 */}
            <div className="flex items-center justify-between mb-2 lg:mb-4">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="p-2 lg:p-3 bg-amber-500 rounded-xl">
                  <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">系统指标</h3>
                  <p className="text-sm text-muted-foreground">关键性能监控</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart2 className="h-4 w-4" />
                <span>24小时趋势</span>
              </div>
            </div>

            {/* 波浪球网格布局 - 减小手机端的上下空间 */}
            <div className="h-[calc(100%-3rem)] lg:h-[calc(100%-4rem)] flex items-center justify-center -mt-2 lg:mt-0">
              <div className="grid grid-cols-3 gap-2 lg:gap-4 w-full">
                {/* API 调用统计 */}
                <div className="flex justify-center">
                  <div className="w-[80px] h-[80px] sm:w-[130px] sm:h-[130px] lg:w-full lg:h-auto lg:max-w-[160px] lg:aspect-square">
                    <WaveSphere 
                      value={Math.round((stats.todayRequests / (stats.totalQuota || 1)) * 100)}
                      size="100%"
                      color="#8B5CF6"
                      label="今日调用"
                    />
                  </div>
                </div>

                {/* 密钥使用情况 */}
                <div className="flex justify-center">
                  <div className="w-[80px] h-[80px] sm:w-[130px] sm:h-[130px] lg:w-full lg:h-auto lg:max-w-[160px] lg:aspect-square">
                    <WaveSphere 
                      value={Math.round((stats.activeApiKeys / stats.totalApiKeys) * 100)}
                      size="100%"
                      color="#10B981"
                      label="密钥活跃度"
                    />
                  </div>
                </div>

                {/* 用户分布 */}
                <div className="flex justify-center">
                  <div className="w-[80px] h-[80px] sm:w-[130px] sm:h-[130px] lg:w-full lg:h-auto lg:max-w-[160px] lg:aspect-square">
                    <WaveSphere 
                      value={Math.round((stats.userCount / stats.totalUsers) * 100)}
                      size="100%"
                      color="#F59E0B"
                      label="用户分布"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 管理员和活跃密钥统计 */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-200/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-500 rounded-xl">
                  <UserPlus2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-violet-600/80">管理员</div>
                  <div className="text-2xl font-bold text-violet-900">{stats.adminCount}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-200/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-500 rounded-xl">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-rose-600/80">活跃密钥</div>
                  <div className="text-2xl font-bold text-rose-900">{stats.activeApiKeys}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 