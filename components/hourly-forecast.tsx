'use client'

import React from "react"

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wind, Droplets, Thermometer, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useSound } from '@/hooks/use-sound'

interface ForecastHour {
  time: string
  hour: number
  aqi: number
  pm25: number
  temp: number
  humidity: number
  windSpeed: number
  trend: 'up' | 'down' | 'stable'
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return '#10b981'
  if (aqi <= 100) return '#22c55e'
  if (aqi <= 150) return '#eab308'
  if (aqi <= 200) return '#f59e0b'
  if (aqi <= 300) return '#ef4444'
  return '#7c2d12'
}

const getAQIBgClass = (aqi: number) => {
  if (aqi <= 50) return 'bg-emerald-500'
  if (aqi <= 100) return 'bg-green-500'
  if (aqi <= 150) return 'bg-yellow-500'
  if (aqi <= 200) return 'bg-amber-500'
  if (aqi <= 300) return 'bg-red-500'
  return 'bg-red-900'
}

const getAQILabel = (aqi: number) => {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy (Sensitive)'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

export function HourlyForecast() {
  const { playSound, vibrate } = useSound()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [forecast, setForecast] = useState<ForecastHour[]>([])
  const [selectedHour, setSelectedHour] = useState<ForecastHour | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const now = new Date()
    const currentHour = now.getHours()
    
    const generateForecast = (): ForecastHour[] => {
      const hours: ForecastHour[] = []
      const baseAQI = 156 + Math.random() * 30
      
      for (let i = 0; i < 12; i++) {
        const forecastHour = (currentHour + i) % 24
        const time = new Date(now.getTime() + i * 60 * 60 * 1000)
        const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
        
        let aqiModifier = 0
        if (forecastHour >= 7 && forecastHour <= 10) aqiModifier = 20
        else if (forecastHour >= 17 && forecastHour <= 20) aqiModifier = 30
        else if (forecastHour >= 2 && forecastHour <= 5) aqiModifier = -30
        else if (forecastHour >= 11 && forecastHour <= 14) aqiModifier = -10
        
        const aqi = Math.round(baseAQI + aqiModifier + (Math.random() - 0.5) * 20)
        const prevAQI = i > 0 ? hours[i - 1].aqi : aqi
        
        hours.push({
          time: timeStr,
          hour: forecastHour,
          aqi: Math.max(30, Math.min(350, aqi)),
          pm25: Math.round((aqi * 0.6) + Math.random() * 20),
          temp: Math.round(24 + Math.sin((forecastHour - 6) * Math.PI / 12) * 8),
          humidity: Math.round(55 + Math.random() * 25),
          windSpeed: Math.round(5 + Math.random() * 15),
          trend: aqi > prevAQI + 5 ? 'up' : aqi < prevAQI - 5 ? 'down' : 'stable'
        })
      }
      
      return hours
    }

    setForecast(generateForecast())
  }, [])

  // Draw the graph
  useEffect(() => {
    if (!canvasRef.current || forecast.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = { top: 30, right: 20, bottom: 50, left: 50 }
    const graphWidth = width - padding.left - padding.right
    const graphHeight = height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Get AQI range
    const maxAQI = Math.max(...forecast.map(f => f.aqi)) + 20
    const minAQI = Math.min(...forecast.map(f => f.aqi)) - 20

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1

    // Horizontal grid lines (AQI levels)
    const aqiLevels = [50, 100, 150, 200, 250, 300]
    aqiLevels.forEach(level => {
      if (level >= minAQI && level <= maxAQI) {
        const y = padding.top + graphHeight - ((level - minAQI) / (maxAQI - minAQI)) * graphHeight
        ctx.beginPath()
        ctx.setLineDash([5, 5])
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
        ctx.setLineDash([])

        // AQI level labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.font = '10px system-ui'
        ctx.textAlign = 'right'
        ctx.fillText(level.toString(), padding.left - 8, y + 3)
      }
    })

    // Vertical grid lines (hours)
    forecast.forEach((_, i) => {
      const x = padding.left + (i / (forecast.length - 1)) * graphWidth
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()
    })

    // Draw colored zones
    const zones = [
      { min: 0, max: 50, color: 'rgba(16, 185, 129, 0.1)' },
      { min: 50, max: 100, color: 'rgba(34, 197, 94, 0.1)' },
      { min: 100, max: 150, color: 'rgba(234, 179, 8, 0.1)' },
      { min: 150, max: 200, color: 'rgba(245, 158, 11, 0.1)' },
      { min: 200, max: 300, color: 'rgba(239, 68, 68, 0.1)' },
      { min: 300, max: 500, color: 'rgba(124, 45, 18, 0.1)' },
    ]

    zones.forEach(zone => {
      if (zone.max >= minAQI && zone.min <= maxAQI) {
        const yTop = padding.top + graphHeight - ((Math.min(zone.max, maxAQI) - minAQI) / (maxAQI - minAQI)) * graphHeight
        const yBottom = padding.top + graphHeight - ((Math.max(zone.min, minAQI) - minAQI) / (maxAQI - minAQI)) * graphHeight
        
        ctx.fillStyle = zone.color
        ctx.fillRect(padding.left, yTop, graphWidth, yBottom - yTop)
      }
    })

    // Draw gradient area under line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
    gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)')
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)')

    ctx.beginPath()
    ctx.moveTo(padding.left, height - padding.bottom)
    
    forecast.forEach((hour, i) => {
      const x = padding.left + (i / (forecast.length - 1)) * graphWidth
      const y = padding.top + graphHeight - ((hour.aqi - minAQI) / (maxAQI - minAQI)) * graphHeight
      
      if (i === 0) {
        ctx.lineTo(x, y)
      } else {
        // Smooth curve
        const prevX = padding.left + ((i - 1) / (forecast.length - 1)) * graphWidth
        const prevY = padding.top + graphHeight - ((forecast[i - 1].aqi - minAQI) / (maxAQI - minAQI)) * graphHeight
        const cpX = (prevX + x) / 2
        ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2)
        if (i === forecast.length - 1) {
          ctx.quadraticCurveTo(cpX, (prevY + y) / 2, x, y)
        }
      }
    })
    
    ctx.lineTo(width - padding.right, height - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw main line
    ctx.beginPath()
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    forecast.forEach((hour, i) => {
      const x = padding.left + (i / (forecast.length - 1)) * graphWidth
      const y = padding.top + graphHeight - ((hour.aqi - minAQI) / (maxAQI - minAQI)) * graphHeight
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        const prevX = padding.left + ((i - 1) / (forecast.length - 1)) * graphWidth
        const prevY = padding.top + graphHeight - ((forecast[i - 1].aqi - minAQI) / (maxAQI - minAQI)) * graphHeight
        const cpX = (prevX + x) / 2
        ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2)
        if (i === forecast.length - 1) {
          ctx.quadraticCurveTo(cpX, (prevY + y) / 2, x, y)
        }
      }

      // Change line color based on AQI
      ctx.strokeStyle = getAQIColor(hour.aqi)
    })

    // Draw with gradient stroke
    const lineGradient = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0)
    forecast.forEach((hour, i) => {
      lineGradient.addColorStop(i / (forecast.length - 1), getAQIColor(hour.aqi))
    })
    ctx.strokeStyle = lineGradient
    ctx.stroke()

    // Draw data points
    forecast.forEach((hour, i) => {
      const x = padding.left + (i / (forecast.length - 1)) * graphWidth
      const y = padding.top + graphHeight - ((hour.aqi - minAQI) / (maxAQI - minAQI)) * graphHeight
      
      // Outer glow
      ctx.beginPath()
      ctx.arc(x, y, hoveredIndex === i ? 12 : 8, 0, Math.PI * 2)
      ctx.fillStyle = `${getAQIColor(hour.aqi)}40`
      ctx.fill()

      // Point
      ctx.beginPath()
      ctx.arc(x, y, hoveredIndex === i ? 8 : 5, 0, Math.PI * 2)
      ctx.fillStyle = getAQIColor(hour.aqi)
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()

      // Time labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '11px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(i === 0 ? 'Now' : hour.time, x, height - padding.bottom + 20)

      // AQI value above point (only for hovered or selected)
      if (hoveredIndex === i || selectedHour?.time === hour.time) {
        ctx.fillStyle = 'white'
        ctx.font = 'bold 12px system-ui'
        ctx.fillText(hour.aqi.toString(), x, y - 15)
      }
    })

    // Y-axis label
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('AQI Level', 0, 0)
    ctx.restore()

  }, [forecast, hoveredIndex, selectedHour])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || forecast.length === 0) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const padding = { left: 50, right: 20 }
    const graphWidth = rect.width - padding.left - padding.right

    const index = Math.round(((x - padding.left) / graphWidth) * (forecast.length - 1))
    if (index >= 0 && index < forecast.length) {
      playSound('click')
      vibrate(30)
      setSelectedHour(forecast[index])
    }
  }

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || forecast.length === 0) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const padding = { left: 50, right: 20 }
    const graphWidth = rect.width - padding.left - padding.right

    const index = Math.round(((x - padding.left) / graphWidth) * (forecast.length - 1))
    if (index >= 0 && index < forecast.length) {
      setHoveredIndex(index)
    } else {
      setHoveredIndex(null)
    }
  }

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-400" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-emerald-400" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Graph */}
      <div className="relative h-[300px] w-full rounded-xl overflow-hidden bg-slate-900/50 border border-emerald-500/20 dark:border-white/10">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMove}
          onMouseLeave={() => setHoveredIndex(null)}
        />
      </div>

      {/* Scrollable hour cards */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-500/30">
        {forecast.map((hour, index) => (
          <button
            key={index}
            onClick={() => {
              playSound('click')
              vibrate(30)
              setSelectedHour(hour)
            }}
            className={`flex-shrink-0 p-3 rounded-xl transition-all duration-200 ${
              selectedHour?.time === hour.time
                ? 'ring-2 ring-emerald-500 scale-105'
                : 'hover:scale-102'
            } glass border border-emerald-500/20 dark:border-white/10`}
          >
            <div className="text-center min-w-[55px]">
              <p className="text-xs text-muted-foreground dark:text-white/50 mb-1">
                {index === 0 ? 'Now' : hour.time}
              </p>
              <div 
                className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1 shadow-lg"
                style={{ backgroundColor: getAQIColor(hour.aqi) }}
              >
                <span className="text-white font-bold text-sm">{hour.aqi}</span>
              </div>
              <div className="flex items-center justify-center">
                <TrendIcon trend={hour.trend} />
              </div>
              <p className="text-xs text-foreground dark:text-white mt-1">{hour.temp}°C</p>
            </div>
          </button>
        ))}
      </div>

      {/* Selected hour details */}
      {selectedHour && (
        <Card className="glass border-emerald-500/30 p-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-foreground dark:text-white text-lg">
                {selectedHour.time} Forecast
              </h4>
              <Badge 
                className="mt-1 text-white"
                style={{ backgroundColor: getAQIColor(selectedHour.aqi) }}
              >
                {getAQILabel(selectedHour.aqi)}
              </Badge>
            </div>
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: getAQIColor(selectedHour.aqi) }}
            >
              <span className="text-white font-bold text-2xl">{selectedHour.aqi}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-white/5">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Thermometer className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground dark:text-white/50">Temperature</p>
                <p className="font-bold text-foreground dark:text-white">{selectedHour.temp}°C</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-white/5">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground dark:text-white/50">Humidity</p>
                <p className="font-bold text-foreground dark:text-white">{selectedHour.humidity}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-white/5">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Wind className="h-4 w-4 text-cyan-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground dark:text-white/50">Wind Speed</p>
                <p className="font-bold text-foreground dark:text-white">{selectedHour.windSpeed} km/h</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-white/5">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground dark:text-white/50">PM2.5</p>
                <p className="font-bold text-foreground dark:text-white">{selectedHour.pm25} µg/m³</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-sm text-foreground dark:text-white">
              {selectedHour.aqi <= 100 
                ? 'Good time for outdoor activities!'
                : selectedHour.aqi <= 150
                ? 'Sensitive groups should limit prolonged outdoor exertion.'
                : selectedHour.aqi <= 200
                ? 'Avoid prolonged outdoor activities. Consider wearing N95 mask.'
                : 'Stay indoors. Close windows and use air purifiers.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
