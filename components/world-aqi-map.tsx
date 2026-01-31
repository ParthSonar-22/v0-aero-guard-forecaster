'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navigation, Loader2, Globe, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react'
import { useSound } from '@/hooks/use-sound'
import L from 'leaflet'

interface AQIStation {
  uid: number
  aqi: string
  station: {
    name: string
    geo: [number, number]
  }
}

interface CityAQI {
  name: string
  aqi: number
  lat: number
  lng: number
  status: string
  color: string
  country: string
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return { bg: '#10b981', text: 'Good', textColor: 'text-emerald-400' }
  if (aqi <= 100) return { bg: '#22c55e', text: 'Moderate', textColor: 'text-green-400' }
  if (aqi <= 150) return { bg: '#eab308', text: 'Unhealthy (Sensitive)', textColor: 'text-yellow-400' }
  if (aqi <= 200) return { bg: '#f59e0b', text: 'Unhealthy', textColor: 'text-amber-400' }
  if (aqi <= 300) return { bg: '#ef4444', text: 'Very Unhealthy', textColor: 'text-red-400' }
  return { bg: '#7c2d12', text: 'Hazardous', textColor: 'text-red-600' }
}

// Major world cities with fallback AQI data
const WORLD_CITIES: CityAQI[] = [
  // India
  { name: 'Delhi', aqi: 285, lat: 28.6139, lng: 77.209, status: 'Very Unhealthy', color: '#ef4444', country: 'India' },
  { name: 'Mumbai', aqi: 168, lat: 19.076, lng: 72.8777, status: 'Unhealthy', color: '#f59e0b', country: 'India' },
  { name: 'Kolkata', aqi: 195, lat: 22.5726, lng: 88.3639, status: 'Unhealthy', color: '#f59e0b', country: 'India' },
  { name: 'Chennai', aqi: 89, lat: 13.0827, lng: 80.2707, status: 'Moderate', color: '#22c55e', country: 'India' },
  { name: 'Bangalore', aqi: 112, lat: 12.9716, lng: 77.5946, status: 'Unhealthy (Sensitive)', color: '#eab308', country: 'India' },
  { name: 'Hyderabad', aqi: 134, lat: 17.385, lng: 78.4867, status: 'Unhealthy (Sensitive)', color: '#eab308', country: 'India' },
  { name: 'Pune', aqi: 145, lat: 18.5204, lng: 73.8567, status: 'Unhealthy (Sensitive)', color: '#eab308', country: 'India' },
  { name: 'Ahmedabad', aqi: 178, lat: 23.0225, lng: 72.5714, status: 'Unhealthy', color: '#f59e0b', country: 'India' },
  { name: 'Jaipur', aqi: 201, lat: 26.9124, lng: 75.7873, status: 'Very Unhealthy', color: '#ef4444', country: 'India' },
  { name: 'Lucknow', aqi: 245, lat: 26.8467, lng: 80.9462, status: 'Very Unhealthy', color: '#ef4444', country: 'India' },
  // China
  { name: 'Beijing', aqi: 156, lat: 39.9042, lng: 116.4074, status: 'Unhealthy', color: '#f59e0b', country: 'China' },
  { name: 'Shanghai', aqi: 89, lat: 31.2304, lng: 121.4737, status: 'Moderate', color: '#22c55e', country: 'China' },
  { name: 'Guangzhou', aqi: 78, lat: 23.1291, lng: 113.2644, status: 'Moderate', color: '#22c55e', country: 'China' },
  { name: 'Shenzhen', aqi: 65, lat: 22.5431, lng: 114.0579, status: 'Moderate', color: '#22c55e', country: 'China' },
  // Southeast Asia
  { name: 'Bangkok', aqi: 142, lat: 13.7563, lng: 100.5018, status: 'Unhealthy (Sensitive)', color: '#eab308', country: 'Thailand' },
  { name: 'Jakarta', aqi: 165, lat: -6.2088, lng: 106.8456, status: 'Unhealthy', color: '#f59e0b', country: 'Indonesia' },
  { name: 'Singapore', aqi: 52, lat: 1.3521, lng: 103.8198, status: 'Moderate', color: '#22c55e', country: 'Singapore' },
  { name: 'Hanoi', aqi: 178, lat: 21.0285, lng: 105.8542, status: 'Unhealthy', color: '#f59e0b', country: 'Vietnam' },
  // Middle East
  { name: 'Dubai', aqi: 98, lat: 25.2048, lng: 55.2708, status: 'Moderate', color: '#22c55e', country: 'UAE' },
  { name: 'Riyadh', aqi: 145, lat: 24.7136, lng: 46.6753, status: 'Unhealthy (Sensitive)', color: '#eab308', country: 'Saudi Arabia' },
  // Europe
  { name: 'London', aqi: 45, lat: 51.5074, lng: -0.1278, status: 'Good', color: '#10b981', country: 'UK' },
  { name: 'Paris', aqi: 52, lat: 48.8566, lng: 2.3522, status: 'Moderate', color: '#22c55e', country: 'France' },
  { name: 'Berlin', aqi: 38, lat: 52.52, lng: 13.405, status: 'Good', color: '#10b981', country: 'Germany' },
  { name: 'Madrid', aqi: 48, lat: 40.4168, lng: -3.7038, status: 'Good', color: '#10b981', country: 'Spain' },
  { name: 'Rome', aqi: 62, lat: 41.9028, lng: 12.4964, status: 'Moderate', color: '#22c55e', country: 'Italy' },
  // Americas
  { name: 'New York', aqi: 58, lat: 40.7128, lng: -74.006, status: 'Moderate', color: '#22c55e', country: 'USA' },
  { name: 'Los Angeles', aqi: 85, lat: 34.0522, lng: -118.2437, status: 'Moderate', color: '#22c55e', country: 'USA' },
  { name: 'Mexico City', aqi: 125, lat: 19.4326, lng: -99.1332, status: 'Unhealthy (Sensitive)', color: '#eab308', country: 'Mexico' },
  { name: 'São Paulo', aqi: 78, lat: -23.5505, lng: -46.6333, status: 'Moderate', color: '#22c55e', country: 'Brazil' },
  // Africa
  { name: 'Cairo', aqi: 168, lat: 30.0444, lng: 31.2357, status: 'Unhealthy', color: '#f59e0b', country: 'Egypt' },
  { name: 'Lagos', aqi: 156, lat: 6.5244, lng: 3.3792, status: 'Unhealthy', color: '#f59e0b', country: 'Nigeria' },
  // Oceania
  { name: 'Sydney', aqi: 42, lat: -33.8688, lng: 151.2093, status: 'Good', color: '#10b981', country: 'Australia' },
  { name: 'Melbourne', aqi: 35, lat: -37.8136, lng: 144.9631, status: 'Good', color: '#10b981', country: 'Australia' },
  // East Asia
  { name: 'Tokyo', aqi: 48, lat: 35.6762, lng: 139.6503, status: 'Good', color: '#10b981', country: 'Japan' },
  { name: 'Seoul', aqi: 89, lat: 37.5665, lng: 126.978, status: 'Moderate', color: '#22c55e', country: 'South Korea' },
]

export function WorldAQIMap() {
  const { playSound, vibrate } = useSound()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [selectedCity, setSelectedCity] = useState<CityAQI | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [cities, setCities] = useState<CityAQI[]>(WORLD_CITIES)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'world' | 'india'>('world')

  // Fetch live AQI data from WAQI API
  const fetchLiveAQI = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // Using WAQI public API - in production you'd use your own API key
      const updatedCities = await Promise.all(
        cities.map(async (city) => {
          try {
            const response = await fetch(
              `https://api.waqi.info/feed/geo:${city.lat};${city.lng}/?token=demo`
            )
            const data = await response.json()
            
            if (data.status === 'ok' && data.data?.aqi) {
              const aqi = typeof data.data.aqi === 'number' ? data.data.aqi : parseInt(data.data.aqi) || city.aqi
              const colorInfo = getAQIColor(aqi)
              return {
                ...city,
                aqi,
                status: colorInfo.text,
                color: colorInfo.bg
              }
            }
            return city
          } catch {
            // Return existing data if fetch fails
            return city
          }
        })
      )
      
      setCities(updatedCities)
      setLastUpdated(new Date())
      playSound('success')
    } catch (error) {
      console.error('Error fetching AQI data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [cities, playSound])

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return

    const loadMap = async () => {
      // Load Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      const map = L.map(mapRef.current!, {
        center: viewMode === 'india' ? [20.5937, 78.9629] : [20, 0],
        zoom: viewMode === 'india' ? 5 : 2,
        zoomControl: false,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true
      })

      mapInstanceRef.current = map

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

  // Update markers when cities data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return

    const updateMarkers = async () => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Add new markers
      cities.forEach((city) => {
        const colorInfo = getAQIColor(city.aqi)
        
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: 40px;
              height: 40px;
              background: ${colorInfo.bg};
              border-radius: 50%;
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 10px;
              box-shadow: 0 4px 20px ${colorInfo.bg}80;
              cursor: pointer;
              transition: transform 0.2s;
            ">
              ${city.aqi}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })

        const marker = L.marker([city.lat, city.lng], { icon })
          .addTo(mapInstanceRef.current!)
          .on('click', () => {
            playSound('click')
            vibrate(30)
            setSelectedCity(city)
          })

        markersRef.current.push(marker)

        // Add heatmap-style circle
        L.circle([city.lat, city.lng], {
          color: colorInfo.bg,
          fillColor: colorInfo.bg,
          fillOpacity: 0.15,
          radius: city.aqi > 150 ? 80000 : 50000,
          weight: 1,
        }).addTo(mapInstanceRef.current!)
      })
    }

    updateMarkers()
  }, [cities, mapLoaded, playSound, vibrate])

  const handleViewChange = async (mode: 'world' | 'india') => {
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

  const getUserLocation = async () => {
    playSound('click')
    vibrate(30)
    setIsLocating(true)
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          
          if (mapInstanceRef.current) {
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
                  animation: pulse 2s infinite;
                ">
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })

            L.marker([latitude, longitude], { icon: userIcon })
              .addTo(mapInstanceRef.current)
            
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
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-emerald-500/20 dark:border-white/10">
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-10">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading World AQI Map...</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            onClick={() => handleViewChange('world')}
            className={`${viewMode === 'world' ? 'bg-emerald-500' : 'glass'} border-emerald-500/30 text-white`}
            size="sm"
          >
            <Globe className="w-4 h-4 mr-1" />
            World
          </Button>
          <Button
            onClick={() => handleViewChange('india')}
            className={`${viewMode === 'india' ? 'bg-emerald-500' : 'glass'} border-emerald-500/30 text-white`}
            size="sm"
          >
            India
          </Button>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button
          onClick={getUserLocation}
          disabled={isLocating}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg border-0"
          size="sm"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
        
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="glass border-emerald-500/30 text-white hover:bg-emerald-500/20"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>

        <Button
          onClick={() => handleZoom('in')}
          className="glass border-emerald-500/30 text-white hover:bg-emerald-500/20"
          size="sm"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => handleZoom('out')}
          className="glass border-emerald-500/30 text-white hover:bg-emerald-500/20"
          size="sm"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Last Updated */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <Badge className="glass border-emerald-500/30 text-emerald-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Badge>
      </div>

      {/* Selected City Info */}
      {selectedCity && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-20 glass p-4 border-emerald-500/30 dark:border-white/20">
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
              className="text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: selectedCity.color }}
            >
              <span className="text-white font-bold text-2xl">{selectedCity.aqi}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground dark:text-white/70 mb-2">
                {selectedCity.aqi <= 50 
                  ? 'Air quality is satisfactory. Enjoy outdoor activities!'
                  : selectedCity.aqi <= 100
                  ? 'Acceptable air quality. Sensitive individuals should limit prolonged outdoor exposure.'
                  : selectedCity.aqi <= 150
                  ? 'Sensitive groups should reduce outdoor activities.'
                  : selectedCity.aqi <= 200
                  ? 'Everyone should reduce prolonged outdoor exertion.'
                  : 'Health alert! Avoid outdoor activities.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 glass p-3 rounded-lg hidden md:block border-emerald-500/30 dark:border-white/20">
        <h4 className="text-xs font-bold text-foreground dark:text-white mb-2">AQI Scale</h4>
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
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground dark:text-white/80">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
