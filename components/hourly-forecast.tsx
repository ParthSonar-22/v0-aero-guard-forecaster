'use client'

import { useState, useEffect } from 'react'
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
  if (aqi <= 50) return 'bg-emerald-500'
  if (aqi <= 100) return 'bg-sky-500'
  if (aqi <= 150) return 'bg-amber-500'
  if (aqi <= 200) return 'bg-orange-500'
  if (aqi <= 300) return 'bg-red-500'
  return 'bg-purple-700'
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
  const [forecast, setForecast] = useState<ForecastHour[]>([])
  const [selectedHour, setSelectedHour] = useState<ForecastHour | null>(null)

  useEffect(() => {
    // Generate dynamic 12-hour forecast based on current time
    const now = new Date()
    const currentHour = now.getHours()
    
    const generateForecast = (): ForecastHour[] => {
      const hours: ForecastHour[] = []
      const baseAQI = 156 + Math.random() * 30
      
      for (let i = 0; i < 12; i++) {
        const forecastHour = (currentHour + i) % 24
        const time = new Date(now.getTime() + i * 60 * 60 * 1000)
        const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
        
        // Simulate AQI patterns (higher in morning/evening rush hours)
        let aqiModifier = 0
        if (forecastHour >= 7 && forecastHour <= 10) aqiModifier = 20 // Morning rush
        else if (forecastHour >= 17 && forecastHour <= 20) aqiModifier = 30 // Evening rush
        else if (forecastHour >= 2 && forecastHour <= 5) aqiModifier = -30 // Late night improvement
        else if (forecastHour >= 11 && forecastHour <= 14) aqiModifier = -10 // Midday slight improvement
        
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
    setSelectedHour(null)
  }, [])

  const handleHourClick = (hour: ForecastHour) => {
    playSound('click')
    vibrate(30)
    setSelectedHour(hour)
  }

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-400" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-emerald-400" />
      default:
        return <Minus className="h-3 w-3 text-white/50" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Horizontal scrollable forecast */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent">
        {forecast.map((hour, index) => (
          <button
            key={index}
            onClick={() => handleHourClick(hour)}
            className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 ${
              selectedHour?.time === hour.time
                ? 'bg-emerald-500/30 border-2 border-emerald-500 scale-105'
                : 'glass border border-emerald-500/20 dark:border-white/10 hover:border-emerald-500/50 hover:scale-102'
            }`}
          >
            <div className="text-center min-w-[60px]">
              <p className="text-xs text-muted-foreground dark:text-white/50 mb-1">
                {index === 0 ? 'Now' : hour.time}
              </p>
              <div className={`w-10 h-10 mx-auto rounded-full ${getAQIColor(hour.aqi)} flex items-center justify-center mb-1 shadow-lg`}>
                <span className="text-white font-bold text-sm">{hour.aqi}</span>
              </div>
              <div className="flex items-center justify-center gap-1">
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
              <Badge className={`${getAQIColor(selectedHour.aqi)} text-white mt-1`}>
                {getAQILabel(selectedHour.aqi)}
              </Badge>
            </div>
            <div className={`w-16 h-16 rounded-full ${getAQIColor(selectedHour.aqi)} flex items-center justify-center shadow-lg`}>
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
          
          {/* Recommendation based on forecast */}
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-sm text-foreground dark:text-white">
              {selectedHour.aqi <= 100 
                ? 'Good time for outdoor activities. Enjoy your day!'
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
