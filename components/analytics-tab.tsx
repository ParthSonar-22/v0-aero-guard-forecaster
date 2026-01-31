'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Activity, Wind, Droplets, Thermometer, Calendar, Clock } from 'lucide-react'

const weeklyData = [
  { day: 'Mon', aqi: 145, pm25: 72, pm10: 98 },
  { day: 'Tue', aqi: 162, pm25: 81, pm10: 112 },
  { day: 'Wed', aqi: 178, pm25: 89, pm10: 125 },
  { day: 'Thu', aqi: 155, pm25: 77, pm10: 105 },
  { day: 'Fri', aqi: 168, pm25: 84, pm10: 118 },
  { day: 'Sat', aqi: 142, pm25: 71, pm10: 95 },
  { day: 'Sun', aqi: 138, pm25: 69, pm10: 92 },
]

const hourlyTrend = [
  { hour: '6AM', aqi: 120 },
  { hour: '9AM', aqi: 165 },
  { hour: '12PM', aqi: 178 },
  { hour: '3PM', aqi: 185 },
  { hour: '6PM', aqi: 195 },
  { hour: '9PM', aqi: 172 },
  { hour: '12AM', aqi: 145 },
]

const pollutantSources = [
  { name: 'Vehicles', value: 35, color: '#f59e0b' },
  { name: 'Industry', value: 25, color: '#ef4444' },
  { name: 'Construction', value: 20, color: '#8b5cf6' },
  { name: 'Dust', value: 12, color: '#0ea5e9' },
  { name: 'Other', value: 8, color: '#10b981' },
]

const monthlyComparison = [
  { month: 'Jan', current: 165, previous: 178 },
  { month: 'Feb', current: 158, previous: 172 },
  { month: 'Mar', current: 145, previous: 160 },
  { month: 'Apr', current: 132, previous: 145 },
  { month: 'May', current: 118, previous: 130 },
  { month: 'Jun', current: 95, previous: 112 },
]

interface AnalyticsTabProps {
  currentAQI: number
}

export function AnalyticsTab({ currentAQI }: AnalyticsTabProps) {
  const avgAQI = Math.round(weeklyData.reduce((acc, d) => acc + d.aqi, 0) / weeklyData.length)
  const trend = currentAQI > avgAQI ? 'up' : 'down'
  const trendPercent = Math.abs(Math.round(((currentAQI - avgAQI) / avgAQI) * 100))

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground dark:text-white mb-2">Analytics & Trends</h1>
        <p className="text-muted-foreground dark:text-white/60">Comprehensive air quality analysis for Mumbai</p>
      </div>
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="glass border-emerald-500/20 dark:border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground dark:text-white/60 mb-1">Weekly Average</p>
                <p className="text-2xl font-bold text-foreground dark:text-white">{avgAQI}</p>
              </div>
              <Activity className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-amber-500/20 dark:border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground dark:text-white/60 mb-1">Trend</p>
                <div className="flex items-center gap-1">
                  {trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className={`text-xl font-bold ${trend === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {trendPercent}%
                  </span>
                </div>
              </div>
              <TrendingUp className={`w-8 h-8 ${trend === 'up' ? 'text-red-500' : 'text-emerald-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-cyan-500/20 dark:border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground dark:text-white/60 mb-1">Wind Speed</p>
                <p className="text-2xl font-bold text-foreground dark:text-white">12 km/h</p>
              </div>
              <Wind className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-blue-500/20 dark:border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground dark:text-white/60 mb-1">Humidity</p>
                <p className="text-2xl font-bold text-foreground dark:text-white">68%</p>
              </div>
              <Droplets className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="glass border-emerald-500/20 dark:border-emerald-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Weekly AQI Overview
            </CardTitle>
            <CardDescription className="dark:text-white/60">Past 7 days air quality index</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tick={{ fill: 'currentColor', fontSize: 12 }} />
                <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(13, 33, 55, 0.95)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Bar dataKey="aqi" fill="url(#aqiGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-amber-500/20 dark:border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
              <Clock className="w-5 h-5 text-amber-500" />
              Daily Pattern
            </CardTitle>
            <CardDescription className="dark:text-white/60">AQI variation throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={hourlyTrend}>
                <XAxis dataKey="hour" tick={{ fill: 'currentColor', fontSize: 12 }} />
                <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(13, 33, 55, 0.95)', 
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Area type="monotone" dataKey="aqi" stroke="#f59e0b" fill="url(#hourlyGradient)" strokeWidth={2} />
                <defs>
                  <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass border-purple-500/20 dark:border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-foreground dark:text-white">Pollution Sources</CardTitle>
            <CardDescription className="dark:text-white/60">Main contributors to air pollution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pollutantSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pollutantSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 glass border-cyan-500/20 dark:border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-foreground dark:text-white">Year-over-Year Comparison</CardTitle>
            <CardDescription className="dark:text-white/60">2026 vs 2025 monthly averages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyComparison}>
                <XAxis dataKey="month" tick={{ fill: 'currentColor', fontSize: 12 }} />
                <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(13, 33, 55, 0.95)', 
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Line type="monotone" dataKey="current" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="2026" />
                <Line type="monotone" dataKey="previous" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="2025" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground dark:text-white/60">2026 (Current)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-muted-foreground dark:text-white/60">2025 (Previous)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
