'use client'

import { LayoutDashboard, Map, TrendingUp, Settings, Bell, Shield, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSound } from '@/hooks/use-sound'

interface DashboardSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  const { playSound, vibrate } = useSound()
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Live Map', icon: Map },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] glass border-r border-emerald-500/20 dark:border-white/10 p-4 hidden md:block">
      {/* User Profile Section */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground dark:text-white">Protected</p>
            <p className="text-xs text-muted-foreground dark:text-white/60">Premium User</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span className="text-xs text-muted-foreground dark:text-white/70">Real-time monitoring active</span>
        </div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => {
                playSound('click')
                vibrate(30)
                onTabChange(item.id)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                activeTab === item.id
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-foreground/70 dark:text-white/70 hover:bg-emerald-500/10 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      
      {/* AQI Quick Status */}
      <div className="mt-6 p-4 rounded-xl glass border border-emerald-500/20 dark:border-white/10">
        <p className="text-xs text-muted-foreground dark:text-white/50 mb-2">Current AQI Status</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-500 dark:text-amber-400">168</span>
          <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            Unhealthy
          </span>
        </div>
      </div>
    </aside>
  )
}
