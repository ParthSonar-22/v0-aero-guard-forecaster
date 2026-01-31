'use client'

import { ChartTooltipContent } from "@/components/ui/chart"

import { ChartTooltip } from "@/components/ui/chart"

import { ChartContainer } from "@/components/ui/chart"

import { ChartConfig } from "@/components/ui/chart"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts'

const generateData = () => {
  const data = []
  const now = new Date()
  
  // Historical data (last 24 hours)
  for (let i = 24; i >= 1; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hour = time.getHours()
    const isPeakHour = hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19
    const baseAQI = isPeakHour ? 85 : 60
    const variance = Math.random() * 20 - 10
    
    data.push({
      time: time.getHours().toString().padStart(2, '0') + ':00',
      historical: Math.max(30, Math.min(120, baseAQI + variance)),
      predicted: null,
    })
  }
  
  // Current time marker
  data.push({
    time: 'Now',
    historical: 72,
    predicted: 72,
  })
  
  // Predicted data (next 12 hours)
  for (let i = 1; i <= 12; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000)
    const hour = time.getHours()
    const isPeakHour = hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19
    const baseAQI = isPeakHour ? 90 : 65
    const variance = Math.random() * 15 - 7.5
    
    data.push({
      time: i <= 6 ? `+${i}h` : (i === 12 ? '+12h' : ''),
      historical: null,
      predicted: Math.max(40, Math.min(130, baseAQI + variance)),
    })
  }
  
  return data
}

const chartData = generateData()

export function AQIChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          stroke="hsl(var(--border))"
        />
        <YAxis 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          stroke="hsl(var(--border))"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <ReferenceLine 
          x="Now" 
          stroke="hsl(var(--foreground))" 
          strokeDasharray="3 3"
          strokeWidth={2}
        />
        <ReferenceLine y={50} stroke="hsl(var(--primary))" strokeDasharray="5 5" strokeOpacity={0.3} />
        <ReferenceLine y={100} stroke="hsl(var(--accent))" strokeDasharray="5 5" strokeOpacity={0.3} />
        <Area
          type="monotone"
          dataKey="historical"
          stroke="hsl(var(--primary))"
          fill="url(#historicalGradient)"
          strokeWidth={2}
          connectNulls={false}
          name="Historical AQI"
        />
        <Area
          type="monotone"
          dataKey="predicted"
          stroke="hsl(var(--accent))"
          fill="url(#predictedGradient)"
          strokeWidth={2}
          strokeDasharray="5 5"
          connectNulls={false}
          name="Predicted AQI"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
