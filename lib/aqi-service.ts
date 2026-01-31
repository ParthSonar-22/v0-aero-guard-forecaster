// Live AQI Data Service
// Uses WAQI (World Air Quality Index) API for real-time data

export interface CityAQIData {
  city: string
  aqi: number
  status: string
  statusColor: string
  pm25: number
  pm10: number
  temperature: number
  humidity: number
  wind: number
  lastUpdated: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface AQIResponse {
  status: string
  data: {
    aqi: number
    idx: number
    city: {
      name: string
      geo: [number, number]
    }
    time: {
      s: string
      iso: string
    }
    iaqi: {
      pm25?: { v: number }
      pm10?: { v: number }
      t?: { v: number }
      h?: { v: number }
      w?: { v: number }
      o3?: { v: number }
      no2?: { v: number }
      so2?: { v: number }
      co?: { v: number }
    }
  }
}

// Indian cities with their WAQI station IDs or search names
export const INDIAN_CITIES = [
  { name: 'Mumbai', searchName: 'mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', searchName: 'delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Bangalore', searchName: 'bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', searchName: 'chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', searchName: 'kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad', searchName: 'hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Pune', searchName: 'pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', searchName: 'ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', searchName: 'jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', searchName: 'lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Chandigarh', searchName: 'chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Noida', searchName: 'noida', lat: 28.5355, lng: 77.391 },
  { name: 'Gurgaon', searchName: 'gurgaon', lat: 28.4595, lng: 77.0266 },
  { name: 'Varanasi', searchName: 'varanasi', lat: 25.3176, lng: 82.9739 },
  { name: 'Patna', searchName: 'patna', lat: 25.5941, lng: 85.1376 },
]

// Mumbai specific locations
export const MUMBAI_LOCATIONS = [
  { name: 'Bandra', lat: 19.0596, lng: 72.8295, area: 'Western Suburbs' },
  { name: 'Andheri', lat: 19.1136, lng: 72.8697, area: 'Western Suburbs' },
  { name: 'Colaba', lat: 18.9067, lng: 72.8147, area: 'South Mumbai' },
  { name: 'Worli', lat: 19.0176, lng: 72.8152, area: 'South Mumbai' },
  { name: 'Powai', lat: 19.1176, lng: 72.9060, area: 'Central Suburbs' },
  { name: 'Malad', lat: 19.1874, lng: 72.8484, area: 'Western Suburbs' },
  { name: 'Chembur', lat: 19.0522, lng: 72.8994, area: 'Eastern Suburbs' },
  { name: 'Thane', lat: 19.2183, lng: 72.9781, area: 'Extended Suburbs' },
  { name: 'Navi Mumbai', lat: 19.0330, lng: 73.0297, area: 'Extended Suburbs' },
  { name: 'Dadar', lat: 19.0178, lng: 72.8478, area: 'Central Mumbai' },
  { name: 'Kurla', lat: 19.0726, lng: 72.8845, area: 'Central Suburbs' },
  { name: 'Goregaon', lat: 19.1663, lng: 72.8526, area: 'Western Suburbs' },
]

export function getAQIStatus(aqi: number): { status: string; color: string; bgColor: string } {
  if (aqi <= 50) return { status: 'Good', color: '#10b981', bgColor: 'bg-emerald-500' }
  if (aqi <= 100) return { status: 'Moderate', color: '#eab308', bgColor: 'bg-yellow-500' }
  if (aqi <= 150) return { status: 'Unhealthy for Sensitive', color: '#f97316', bgColor: 'bg-orange-500' }
  if (aqi <= 200) return { status: 'Unhealthy', color: '#ef4444', bgColor: 'bg-red-500' }
  if (aqi <= 300) return { status: 'Very Unhealthy', color: '#7c3aed', bgColor: 'bg-purple-500' }
  return { status: 'Hazardous', color: '#991b1b', bgColor: 'bg-red-900' }
}

export function getHealthRecommendation(aqi: number, hasHealthCondition: boolean = false): string {
  if (aqi <= 50) {
    return 'Air quality is satisfactory. Enjoy outdoor activities!'
  }
  if (aqi <= 100) {
    return hasHealthCondition 
      ? 'Unusually sensitive people should consider reducing prolonged outdoor exertion.'
      : 'Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exposure.'
  }
  if (aqi <= 150) {
    return hasHealthCondition
      ? 'Avoid prolonged outdoor exertion. Keep rescue medications handy.'
      : 'Sensitive groups should limit outdoor activities. Others can be active but take breaks.'
  }
  if (aqi <= 200) {
    return hasHealthCondition
      ? 'Stay indoors and keep windows closed. Use air purifier if available.'
      : 'Everyone should reduce prolonged outdoor exertion. Sensitive groups should avoid outdoor activities.'
  }
  if (aqi <= 300) {
    return 'Health alert! Everyone should avoid outdoor exertion. Stay indoors with air filtration.'
  }
  return 'Health emergency! Avoid all outdoor activities. Keep doors and windows closed. Use N95 mask if going outside is unavoidable.'
}

// Simulated real-time data with realistic variations
export function generateRealisticAQI(baseAqi: number, hour: number): number {
  // Rush hours have higher pollution
  const rushHourMultiplier = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20) ? 1.2 : 1
  // Night time has slightly lower pollution
  const nightMultiplier = (hour >= 22 || hour <= 5) ? 0.85 : 1
  // Random variation of ±15%
  const randomVariation = 0.85 + Math.random() * 0.3
  
  return Math.round(baseAqi * rushHourMultiplier * nightMultiplier * randomVariation)
}

// Generate forecast data for next 12 hours
export function generateHourlyForecast(currentAqi: number): Array<{
  hour: string
  aqi: number
  temp: number
  humidity: number
  status: string
  color: string
}> {
  const forecast = []
  const now = new Date()
  
  for (let i = 0; i < 12; i++) {
    const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000)
    const hour = forecastTime.getHours()
    const aqi = generateRealisticAQI(currentAqi, hour)
    const { status, color } = getAQIStatus(aqi)
    
    // Temperature varies by time of day
    const baseTemp = 25
    const tempVariation = hour >= 10 && hour <= 16 ? 5 : hour >= 6 && hour <= 9 ? 2 : -2
    const temp = Math.round(baseTemp + tempVariation + (Math.random() * 4 - 2))
    
    // Humidity inversely related to temperature
    const humidity = Math.round(60 - tempVariation * 2 + (Math.random() * 10 - 5))
    
    forecast.push({
      hour: forecastTime.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      aqi,
      temp,
      humidity,
      status,
      color
    })
  }
  
  return forecast
}
