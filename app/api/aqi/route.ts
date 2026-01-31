import { NextResponse } from 'next/server'

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
  temperature?: number
  humidity?: number
  lastUpdated?: string
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return { bg: '#10b981', text: 'Good' }
  if (aqi <= 100) return { bg: '#22c55e', text: 'Moderate' }
  if (aqi <= 150) return { bg: '#eab308', text: 'Unhealthy for Sensitive' }
  if (aqi <= 200) return { bg: '#f59e0b', text: 'Unhealthy' }
  if (aqi <= 300) return { bg: '#ef4444', text: 'Very Unhealthy' }
  return { bg: '#7c2d12', text: 'Hazardous' }
}

// All cities with coordinates
const CITY_COORDS = [
  // India - Major Cities
  { name: 'Delhi', lat: 28.6139, lng: 77.209, country: 'India' },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, country: 'India' },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, country: 'India' },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, country: 'India' },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946, country: 'India' },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867, country: 'India' },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, country: 'India' },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, country: 'India' },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, country: 'India' },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462, country: 'India' },
  { name: 'Kanpur', lat: 26.4499, lng: 80.3319, country: 'India' },
  { name: 'Patna', lat: 25.5941, lng: 85.1376, country: 'India' },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126, country: 'India' },
  { name: 'Indore', lat: 22.7196, lng: 75.8577, country: 'India' },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882, country: 'India' },
  { name: 'Surat', lat: 21.1702, lng: 72.8311, country: 'India' },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739, country: 'India' },
  { name: 'Agra', lat: 27.1767, lng: 78.0081, country: 'India' },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, country: 'India' },
  { name: 'Guwahati', lat: 26.1445, lng: 91.7362, country: 'India' },
  // China
  { name: 'Beijing', lat: 39.9042, lng: 116.4074, country: 'China' },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737, country: 'China' },
  { name: 'Guangzhou', lat: 23.1291, lng: 113.2644, country: 'China' },
  { name: 'Shenzhen', lat: 22.5431, lng: 114.0579, country: 'China' },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, country: 'China' },
  // Southeast Asia
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018, country: 'Thailand' },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456, country: 'Indonesia' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  { name: 'Hanoi', lat: 21.0285, lng: 105.8542, country: 'Vietnam' },
  { name: 'Kuala Lumpur', lat: 3.139, lng: 101.6869, country: 'Malaysia' },
  { name: 'Manila', lat: 14.5995, lng: 120.9842, country: 'Philippines' },
  // Middle East
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'UAE' },
  { name: 'Riyadh', lat: 24.7136, lng: 46.6753, country: 'Saudi Arabia' },
  { name: 'Tehran', lat: 35.6892, lng: 51.389, country: 'Iran' },
  // Europe
  { name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
  { name: 'Berlin', lat: 52.52, lng: 13.405, country: 'Germany' },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038, country: 'Spain' },
  { name: 'Rome', lat: 41.9028, lng: 12.4964, country: 'Italy' },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, country: 'Russia' },
  // Americas
  { name: 'New York', lat: 40.7128, lng: -74.006, country: 'USA' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'USA' },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298, country: 'USA' },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'Mexico' },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, country: 'Argentina' },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832, country: 'Canada' },
  // Africa
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, country: 'Egypt' },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792, country: 'Nigeria' },
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, country: 'South Africa' },
  // Oceania
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { name: 'Melbourne', lat: -37.8136, lng: 144.9631, country: 'Australia' },
  // East Asia
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },
  { name: 'Seoul', lat: 37.5665, lng: 126.978, country: 'South Korea' },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'world'

  try {
    // Filter cities based on type
    let citiesToFetch = CITY_COORDS
    if (type === 'india') {
      citiesToFetch = CITY_COORDS.filter(c => c.country === 'India')
    }

    // Fetch real-time data from Open-Meteo Air Quality API
    const results: CityAQI[] = await Promise.all(
      citiesToFetch.map(async (city) => {
        try {
          const response = await fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lng}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`,
            { 
              cache: 'no-store' // Always fetch fresh data
            }
          )
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
          }
          
          const data = await response.json()
          
          if (data.current && data.current.us_aqi !== null) {
            const aqi = Math.round(data.current.us_aqi)
            const colorInfo = getAQIColor(aqi)
            
            return {
              name: city.name,
              lat: city.lat,
              lng: city.lng,
              country: city.country,
              aqi: aqi,
              status: colorInfo.text,
              color: colorInfo.bg,
              pm25: data.current.pm2_5 ? Math.round(data.current.pm2_5 * 10) / 10 : undefined,
              pm10: data.current.pm10 ? Math.round(data.current.pm10 * 10) / 10 : undefined,
              o3: data.current.ozone ? Math.round(data.current.ozone * 10) / 10 : undefined,
              no2: data.current.nitrogen_dioxide ? Math.round(data.current.nitrogen_dioxide * 10) / 10 : undefined,
              so2: data.current.sulphur_dioxide ? Math.round(data.current.sulphur_dioxide * 10) / 10 : undefined,
              co: data.current.carbon_monoxide ? Math.round(data.current.carbon_monoxide * 10) / 10 : undefined,
              lastUpdated: new Date().toISOString()
            }
          }
          
          throw new Error('No AQI data available')
        } catch (error) {
          // Return null for failed fetches, we'll filter these out
          console.error(`Failed to fetch AQI for ${city.name}:`, error)
          return null
        }
      })
    )
    
    // Filter out null results
    const validResults = results.filter((r): r is CityAQI => r !== null)
    
    return NextResponse.json({
      success: true,
      data: validResults,
      totalCities: validResults.length,
      lastUpdated: new Date().toISOString(),
      source: 'Open-Meteo Air Quality API (Real-time)'
    })
  } catch (error) {
    console.error('Error in AQI API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AQI data' },
      { status: 500 }
    )
  }
}
