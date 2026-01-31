'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navigation, Loader2, Globe, ZoomIn, ZoomOut, RefreshCw, AlertCircle } from 'lucide-react'
import { useSound } from '@/hooks/use-sound'
import L from 'leaflet'

interface CityAQI {
  name: string
  aqi: number
  lat: number
  lng: number
  status: string
  color: string
  country: string
  pm25?: number
  pm10?: number
  o3?: number
  no2?: number
  so2?: number
  co?: number
  lastUpdated?: string
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return { bg: '#22c55e', text: 'Good', textColor: 'text-green-400' }
  if (aqi <= 100) return { bg: '#3b82f6', text: 'Moderate', textColor: 'text-blue-400' }
  if (aqi <= 150) return { bg: '#f59e0b', text: 'Unhealthy (Sensitive)', textColor: 'text-amber-400' }
  if (aqi <= 200) return { bg: '#f97316', text: 'Unhealthy', textColor: 'text-orange-400' }
  if (aqi <= 300) return { bg: '#ef4444', text: 'Very Unhealthy', textColor: 'text-red-400' }
  return { bg: '#7c2d12', text: 'Hazardous', textColor: 'text-red-600' }
}

export function WorldAQIMap() {
  const { playSound, vibrate } = useSound()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const [selectedCity, setSelectedCity] = useState<CityAQI | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [cities, setCities] = useState<CityAQI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'world' | 'india'>('world')

  // Fetch live AQI data from our API
  const fetchLiveAQI = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/aqi?type=${viewMode}`, {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch AQI data')
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        setCities(data.data)
        setLastUpdated(new Date(data.lastUpdated))
        playSound('success')
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (err) {
      console.error('Error fetching AQI data:', err)
      setError('Failed to load AQI data. Please try again.')
      playSound('error')
    } finally {
      setIsLoading(false)
    }
  }, [viewMode, playSound])

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return
    
    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const loadMap = async () => {
      // Load Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Wait for CSS to load
      await new Promise(resolve => setTimeout(resolve, 100))

      const map = L.map(mapRef.current!, {
        center: viewMode === 'india' ? [20.5937, 78.9629] : [20, 0],
        zoom: viewMode === 'india' ? 5 : 2,
        zoomControl: false,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true
      })

      mapInstanceRef.current = map
      markersLayerRef.current = L.layerGroup().addTo(map)

      // Dark theme map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CartoDB',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // Add zoom controls
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map)

      setMapLoaded(true)
    }

    loadMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [viewMode])

  // Fetch data when component mounts or view mode changes
  useEffect(() => {
    fetchLiveAQI()
  }, [fetchLiveAQI])

  // Update markers when cities data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !markersLayerRef.current) return

    // Clear existing markers
    markersLayerRef.current.clearLayers()

    // Add new markers for each city
    cities.forEach((city) => {
      const colorInfo = getAQIColor(city.aqi)
      
      // Create custom marker with AQI value
      const icon = L.divIcon({
        className: 'custom-aqi-marker',
        html: `
          <div style="
            position: relative;
            width: 44px;
            height: 44px;
            background: ${colorInfo.bg};
            border-radius: 50%;
            border: 3px solid rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
            box-shadow: 0 4px 15px ${colorInfo.bg}90, 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          ">
            ${city.aqi}
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      })

      const marker = L.marker([city.lat, city.lng], { icon })
        .on('click', () => {
          playSound('click')
          vibrate(30)
          setSelectedCity(city)
        })

      markersLayerRef.current!.addLayer(marker)

      // Add heatmap-style circle around marker
      const circle = L.circle([city.lat, city.lng], {
        color: colorInfo.bg,
        fillColor: colorInfo.bg,
        fillOpacity: 0.15,
        radius: Math.min(city.aqi * 400, 100000),
        weight: 1,
        opacity: 0.5
      })
      
      markersLayerRef.current!.addLayer(circle)
    })
  }, [cities, mapLoaded, playSound, vibrate])

  const handleViewChange = (mode: 'world' | 'india') => {
    playSound('click')
    vibrate(30)
    setViewMode(mode)
    
    if (mapInstanceRef.current) {
      if (mode === 'india') {
        mapInstanceRef.current.setView([20.5937, 78.9629], 5)
      } else {
        mapInstanceRef.current.setView([20, 0], 2)
      }
    }
  }

  const getUserLocation = () => {
    playSound('click')
    vibrate(30)
    setIsLocating(true)
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          
          if (mapInstanceRef.current && markersLayerRef.current) {
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background: #3b82f6;
                  border-radius: 50%;
                  border: 4px solid white;
                  box-shadow: 0 0 20px #3b82f6, 0 0 40px #3b82f680;
                ">
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })

            const userMarker = L.marker([latitude, longitude], { icon: userIcon })
            markersLayerRef.current.addLayer(userMarker)
            
            mapInstanceRef.current.setView([latitude, longitude], 10)
          }
          
          playSound('success')
          setIsLocating(false)
        },
        () => {
          playSound('error')
          setIsLocating(false)
        }
      )
    }
  }

  const handleRefresh = () => {
    playSound('click')
    vibrate(30)
    fetchLiveAQI()
  }

  const handleZoom = (direction: 'in' | 'out') => {
    playSound('click')
    vibrate(20)
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom()
      mapInstanceRef.current.setZoom(direction === 'in' ? currentZoom + 1 : currentZoom - 1)
    }
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-blue-500/20 dark:border-blue-500/30">
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Loading State */}
      {(isLoading || !mapLoaded) && (
        <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center z-30">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <span className="text-lg">Loading Live AQI Data...</span>
            <span className="text-sm text-white/60">Fetching from AQICN API</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <button onClick={handleRefresh} className="ml-2 underline">Retry</button>
          </div>
        </div>
      )}

      {/* View Toggle Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            onClick={() => handleViewChange('world')}
            className={`${viewMode === 'world' ? 'bg-blue-500 hover:bg-blue-600' : 'glass hover:bg-white/10 bg-transparent'} border-blue-500/30 text-white`}
            size="sm"
          >
            <Globe className="w-4 h-4 mr-1" />
            World
          </Button>
          <Button
            onClick={() => handleViewChange('india')}
            className={`${viewMode === 'india' ? 'bg-blue-500 hover:bg-blue-600' : 'glass hover:bg-white/10 bg-transparent'} border-blue-500/30 text-white`}
            size="sm"
          >
            India
          </Button>
        </div>
        <div className="glass px-3 py-1 rounded text-xs text-white/80">
          {cities.length} cities - Real-time AQICN
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button
          onClick={getUserLocation}
          disabled={isLocating}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 border-0"
          size="sm"
          title="Find my location"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
        
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          className="glass border-blue-500/30 text-white hover:bg-blue-500/20 bg-transparent"
          size="sm"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>

        <Button
          onClick={() => handleZoom('in')}
          className="glass border-blue-500/30 text-white hover:bg-blue-500/20 bg-transparent"
          size="sm"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => handleZoom('out')}
          className="glass border-blue-500/30 text-white hover:bg-blue-500/20 bg-transparent"
          size="sm"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Last Updated Badge */}
      {lastUpdated && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <Badge className="glass border-emerald-500/30 text-emerald-400">
            Live Data - Updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
        </div>
      )}

      {/* Selected City Info Card */}
      {selectedCity && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-20 glass p-4 border-emerald-500/30 dark:border-white/20">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-foreground dark:text-white">{selectedCity.name}</h3>
              <p className="text-xs text-muted-foreground dark:text-white/60">{selectedCity.country}</p>
              <Badge 
                className="mt-1" 
                style={{ backgroundColor: selectedCity.color, color: 'white' }}
              >
                {selectedCity.status}
              </Badge>
            </div>
            <button 
              onClick={() => { playSound('click'); setSelectedCity(null) }} 
              className="text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ backgroundColor: selectedCity.color }}
            >
              <span className="text-white font-bold text-2xl">{selectedCity.aqi}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground dark:text-white/70">
                {selectedCity.aqi <= 50 
                  ? 'Air quality is satisfactory. Enjoy outdoor activities!'
                  : selectedCity.aqi <= 100
                  ? 'Acceptable. Sensitive individuals should limit prolonged outdoor exposure.'
                  : selectedCity.aqi <= 150
                  ? 'Sensitive groups should reduce outdoor activities.'
                  : selectedCity.aqi <= 200
                  ? 'Everyone should reduce prolonged outdoor exertion.'
                  : 'Health alert! Avoid outdoor activities.'}
              </p>
            </div>
          </div>

          {/* Pollutant Details */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {selectedCity.pm25 !== undefined && (
              <div className="bg-white/10 dark:bg-black/20 rounded p-2 text-center">
                <div className="text-muted-foreground dark:text-white/50">PM2.5</div>
                <div className="font-bold text-foreground dark:text-white">{selectedCity.pm25}</div>
              </div>
            )}
            {selectedCity.pm10 !== undefined && (
              <div className="bg-white/10 dark:bg-black/20 rounded p-2 text-center">
                <div className="text-muted-foreground dark:text-white/50">PM10</div>
                <div className="font-bold text-foreground dark:text-white">{selectedCity.pm10}</div>
              </div>
            )}
            {selectedCity.o3 !== undefined && (
              <div className="bg-white/10 dark:bg-black/20 rounded p-2 text-center">
                <div className="text-muted-foreground dark:text-white/50">O₃</div>
                <div className="font-bold text-foreground dark:text-white">{selectedCity.o3}</div>
              </div>
            )}
            {selectedCity.no2 !== undefined && (
              <div className="bg-white/10 dark:bg-black/20 rounded p-2 text-center">
                <div className="text-muted-foreground dark:text-white/50">NO₂</div>
                <div className="font-bold text-foreground dark:text-white">{selectedCity.no2}</div>
              </div>
            )}
            {selectedCity.so2 !== undefined && (
              <div className="bg-white/10 dark:bg-black/20 rounded p-2 text-center">
                <div className="text-muted-foreground dark:text-white/50">SO₂</div>
                <div className="font-bold text-foreground dark:text-white">{selectedCity.so2}</div>
              </div>
            )}
            {selectedCity.co !== undefined && (
              <div className="bg-white/10 dark:bg-black/20 rounded p-2 text-center">
                <div className="text-muted-foreground dark:text-white/50">CO</div>
                <div className="font-bold text-foreground dark:text-white">{selectedCity.co}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* AQI Legend */}
      <div className="absolute bottom-4 left-4 z-20 glass p-3 rounded-lg hidden md:block border-emerald-500/30 dark:border-white/20">
        <h4 className="text-xs font-bold text-foreground dark:text-white mb-2">AQI Scale (US EPA)</h4>
        <div className="space-y-1">
          {[
            { label: 'Good (0-50)', color: '#10b981' },
            { label: 'Moderate (51-100)', color: '#22c55e' },
            { label: 'Unhealthy-S (101-150)', color: '#eab308' },
            { label: 'Unhealthy (151-200)', color: '#f59e0b' },
            { label: 'Very Unhealthy (201-300)', color: '#ef4444' },
            { label: 'Hazardous (300+)', color: '#7c2d12' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground dark:text-white/80">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
