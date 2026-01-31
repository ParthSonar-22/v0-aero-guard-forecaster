'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navigation, Loader2 } from 'lucide-react'

interface PollutionArea {
  id: string
  area: string
  aqi: number
  lat: number
  lng: number
  pm25: number
  pm10: number
}

const pollutionData: PollutionArea[] = [
  { id: '1', area: 'South Mumbai', aqi: 156, lat: 18.9220, lng: 72.8347, pm25: 78, pm10: 112 },
  { id: '2', area: 'Bandra', aqi: 178, lat: 19.0596, lng: 72.8295, pm25: 89, pm10: 134 },
  { id: '3', area: 'Andheri', aqi: 195, lat: 19.1136, lng: 72.8697, pm25: 102, pm10: 156 },
  { id: '4', area: 'Colaba', aqi: 142, lat: 18.9067, lng: 72.8147, pm25: 65, pm10: 98 },
  { id: '5', area: 'Borivali', aqi: 188, lat: 19.2307, lng: 72.8567, pm25: 95, pm10: 145 },
  { id: '6', area: 'Powai', aqi: 165, lat: 19.1176, lng: 72.9060, pm25: 82, pm10: 125 },
  { id: '7', area: 'Juhu', aqi: 172, lat: 19.0883, lng: 72.8262, pm25: 86, pm10: 130 },
  { id: '8', area: 'Navi Mumbai', aqi: 148, lat: 19.0330, lng: 73.0297, pm25: 68, pm10: 105 },
  { id: '9', area: 'Thane', aqi: 182, lat: 19.2183, lng: 72.9781, pm25: 91, pm10: 140 },
  { id: '10', area: 'Dadar', aqi: 169, lat: 19.0178, lng: 72.8478, pm25: 84, pm10: 128 },
]

const getAQIColor = (aqi: number) => {
  if (aqi > 300) return { bg: '#7e22ce', text: 'Hazardous', textColor: 'text-purple-400' }
  if (aqi > 200) return { bg: '#dc2626', text: 'Very Unhealthy', textColor: 'text-red-400' }
  if (aqi > 150) return { bg: '#f59e0b', text: 'Unhealthy', textColor: 'text-amber-400' }
  if (aqi > 100) return { bg: '#eab308', text: 'Moderate', textColor: 'text-yellow-400' }
  if (aqi > 50) return { bg: '#22c55e', text: 'Good', textColor: 'text-green-400' }
  return { bg: '#10b981', text: 'Excellent', textColor: 'text-emerald-400' }
}

export function MumbaiPollutionMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [selectedArea, setSelectedArea] = useState<PollutionArea | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [nearestStation, setNearestStation] = useState<PollutionArea | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return

    const loadLeaflet = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      const L = await import('leaflet')
      const mumbaiCenter: [number, number] = [19.0760, 72.8777]

      const map = L.default.map(mapRef.current!, {
        center: mumbaiCenter,
        zoom: 11,
        zoomControl: true,
      })

      mapInstanceRef.current = map

      L.default.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      pollutionData.forEach((area) => {
        const colorInfo = getAQIColor(area.aqi)
        
        const icon = L.default.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: 44px;
              height: 44px;
              background: ${colorInfo.bg};
              border-radius: 50%;
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 11px;
              box-shadow: 0 4px 20px ${colorInfo.bg}80;
              cursor: pointer;
            ">
              ${area.aqi}
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        })

        L.default.marker([area.lat, area.lng], { icon })
          .addTo(map)
          .on('click', () => setSelectedArea(area))

        L.default.circle([area.lat, area.lng], {
          color: colorInfo.bg,
          fillColor: colorInfo.bg,
          fillOpacity: 0.15,
          radius: 2000,
          weight: 2,
        }).addTo(map)
      })

      setMapLoaded(true)
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const getUserLocation = async () => {
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          
          // Find nearest station
          let nearest = pollutionData[0]
          let minDist = Infinity
          pollutionData.forEach((area) => {
            const dist = Math.sqrt(
              Math.pow(area.lat - latitude, 2) + 
              Math.pow(area.lng - longitude, 2)
            )
            if (dist < minDist) {
              minDist = dist
              nearest = area
            }
          })
          setNearestStation(nearest)
          
          if (mapInstanceRef.current) {
            const L = await import('leaflet')

            const userIcon = L.default.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  width: 24px;
                  height: 24px;
                  background: #3b82f6;
                  border-radius: 50%;
                  border: 4px solid white;
                  box-shadow: 0 0 20px #3b82f6, 0 0 40px #3b82f680;
                ">
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })

            L.default.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstanceRef.current)
            mapInstanceRef.current.setView([latitude, longitude], 13)
          }
          setIsLocating(false)
        },
        () => {
          setIsLocating(false)
        }
      )
    }
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-white/10">
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {!mapLoaded && (
        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-10">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading Mumbai Pollution Map...</span>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={getUserLocation}
          disabled={isLocating}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg border-0"
          size="sm"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Navigation className="w-4 h-4 mr-2" />
          )}
          {isLocating ? 'Locating...' : 'My Location'}
        </Button>
      </div>

      {userLocation && nearestStation && (
        <Card className="absolute top-4 left-4 z-20 glass p-4 max-w-xs border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-white">Your Location</span>
          </div>
          <p className="text-xs text-white/70 mb-3">
            Nearest: <span className="text-white font-medium">{nearestStation.area}</span>
          </p>
          <Badge className={`${getAQIColor(nearestStation.aqi).textColor} bg-white/10 border-0`}>
            AQI {nearestStation.aqi} - {getAQIColor(nearestStation.aqi).text}
          </Badge>
        </Card>
      )}

      {selectedArea && (
        <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-20 glass p-4 border-white/20">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-white">{selectedArea.area}</h3>
              <Badge className={`${getAQIColor(selectedArea.aqi).textColor} bg-white/10 mt-1 border-0`}>
                {getAQIColor(selectedArea.aqi).text}
              </Badge>
            </div>
            <button onClick={() => setSelectedArea(null)} className="text-white/50 hover:text-white text-xl">
              x
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <p className="text-2xl font-bold" style={{ color: getAQIColor(selectedArea.aqi).bg }}>
                {selectedArea.aqi}
              </p>
              <p className="text-xs text-white/60">AQI</p>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <p className="text-2xl font-bold text-amber-400">{selectedArea.pm25}</p>
              <p className="text-xs text-white/60">PM2.5</p>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <p className="text-2xl font-bold text-cyan-400">{selectedArea.pm10}</p>
              <p className="text-xs text-white/60">PM10</p>
            </div>
          </div>
        </Card>
      )}

      <div className="absolute bottom-4 left-4 z-20 glass p-3 rounded-lg hidden md:block border-white/20">
        <h4 className="text-xs font-bold text-white mb-2">AQI Levels</h4>
        <div className="space-y-1">
          {[
            { label: 'Excellent', color: '#10b981' },
            { label: 'Good', color: '#22c55e' },
            { label: 'Moderate', color: '#eab308' },
            { label: 'Unhealthy', color: '#f59e0b' },
            { label: 'Very Unhealthy', color: '#dc2626' },
            { label: 'Hazardous', color: '#7e22ce' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-white/80">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
