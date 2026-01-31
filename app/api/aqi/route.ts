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
  stationUrl?: string
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return { bg: '#22c55e', text: 'Good' }
  if (aqi <= 100) return { bg: '#3b82f6', text: 'Moderate' }
  if (aqi <= 150) return { bg: '#f59e0b', text: 'Unhealthy for Sensitive' }
  if (aqi <= 200) return { bg: '#f97316', text: 'Unhealthy' }
  if (aqi <= 300) return { bg: '#ef4444', text: 'Very Unhealthy' }
  return { bg: '#7c2d12', text: 'Hazardous' }
}

// Major world cities for AQICN API
const WORLD_CITIES = [
  // India
  'delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore', 'hyderabad', 'pune', 
  'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'patna', 'bhopal', 'indore',
  'nagpur', 'surat', 'varanasi', 'agra', 'chandigarh', 'guwahati', 'kochi',
  'thiruvananthapuram', 'coimbatore', 'visakhapatnam', 'gurgaon', 'noida',
  // China
  'beijing', 'shanghai', 'guangzhou', 'shenzhen', 'hongkong', 'chengdu', 'wuhan',
  // Southeast Asia
  'bangkok', 'jakarta', 'singapore', 'hanoi', 'kualalumpur', 'manila', 'hochiminh',
  // Middle East
  'dubai', 'riyadh', 'tehran', 'doha', 'kuwait',
  // Europe
  'london', 'paris', 'berlin', 'madrid', 'rome', 'moscow', 'amsterdam', 'vienna',
  'prague', 'warsaw', 'brussels', 'lisbon', 'stockholm', 'oslo', 'copenhagen',
  // Americas
  'newyork', 'losangeles', 'chicago', 'houston', 'phoenix', 'sanfrancisco',
  'seattle', 'denver', 'miami', 'boston', 'atlanta', 'dallas',
  'mexicocity', 'saopaulo', 'buenosaires', 'lima', 'bogota', 'santiago',
  'toronto', 'vancouver', 'montreal',
  // Africa
  'cairo', 'lagos', 'johannesburg', 'nairobi', 'capetown', 'casablanca',
  // Oceania
  'sydney', 'melbourne', 'brisbane', 'perth', 'auckland',
  // East Asia
  'tokyo', 'seoul', 'osaka', 'taipei', 'busan',
  // South Asia
  'dhaka', 'karachi', 'lahore', 'islamabad', 'kathmandu', 'colombo'
]

const INDIA_CITIES = [
  'delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore', 'hyderabad', 'pune',
  'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'patna', 'bhopal', 'indore',
  'nagpur', 'surat', 'varanasi', 'agra', 'chandigarh', 'guwahati', 'kochi',
  'thiruvananthapuram', 'coimbatore', 'visakhapatnam', 'gurgaon', 'noida',
  'ranchi', 'raipur', 'dehradun', 'shimla', 'amritsar', 'ludhiana', 'jalandhar',
  'jodhpur', 'udaipur', 'ajmer', 'kota', 'gwalior', 'jabalpur', 'allahabad',
  'meerut', 'aligarh', 'moradabad', 'bareilly', 'gorakhpur', 'faridabad',
  'ghaziabad', 'rajkot', 'vadodara', 'nashik', 'aurangabad', 'solapur',
  'kolhapur', 'hubli', 'mysore', 'mangalore', 'belgaum', 'gulbarga',
  'tirupati', 'vijayawada', 'warangal', 'guntur', 'nellore', 'madurai',
  'trichy', 'salem', 'tirunelveli', 'erode', 'vellore', 'bhubaneswar',
  'cuttack', 'rourkela', 'jamshedpur', 'dhanbad', 'bokaro', 'asansol',
  'durgapur', 'siliguri', 'agartala', 'imphal', 'shillong', 'aizawl',
  'itanagar', 'kohima', 'gangtok', 'srinagar', 'jammu', 'leh'
]

// Use demo token - for production, get your own token from https://aqicn.org/data-platform/token/
const AQICN_TOKEN = process.env.AQICN_API_TOKEN || 'demo'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'world'

  const citiesToFetch = type === 'india' ? INDIA_CITIES : WORLD_CITIES

  try {
    const results: CityAQI[] = []
    
    // Fetch data for each city from AQICN API
    const fetchPromises = citiesToFetch.map(async (cityName) => {
      try {
        const response = await fetch(
          `https://api.waqi.info/feed/${cityName}/?token=${AQICN_TOKEN}`,
          { 
            next: { revalidate: 300 }, // Cache for 5 minutes
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        
        if (!response.ok) {
          return null
        }
        
        const data = await response.json()
        
        if (data.status === 'ok' && data.data && data.data.aqi) {
          const aqi = typeof data.data.aqi === 'number' ? data.data.aqi : parseInt(data.data.aqi)
          
          if (isNaN(aqi)) return null
          
          const colorInfo = getAQIColor(aqi)
          const geo = data.data.city?.geo || [0, 0]
          
          return {
            name: data.data.city?.name || cityName,
            lat: parseFloat(geo[0]) || 0,
            lng: parseFloat(geo[1]) || 0,
            country: getCountryFromCity(cityName),
            aqi: aqi,
            status: colorInfo.text,
            color: colorInfo.bg,
            pm25: data.data.iaqi?.pm25?.v,
            pm10: data.data.iaqi?.pm10?.v,
            o3: data.data.iaqi?.o3?.v,
            no2: data.data.iaqi?.no2?.v,
            so2: data.data.iaqi?.so2?.v,
            co: data.data.iaqi?.co?.v,
            temperature: data.data.iaqi?.t?.v,
            humidity: data.data.iaqi?.h?.v,
            lastUpdated: data.data.time?.s || new Date().toISOString(),
            stationUrl: data.data.city?.url
          } as CityAQI
        }
        
        return null
      } catch (error) {
        console.error(`Failed to fetch ${cityName}:`, error)
        return null
      }
    })
    
    const fetchedResults = await Promise.all(fetchPromises)
    
    // Filter out null results and add to results array
    fetchedResults.forEach(result => {
      if (result) {
        results.push(result)
      }
    })
    
    return NextResponse.json({
      success: true,
      data: results,
      totalCities: results.length,
      lastUpdated: new Date().toISOString(),
      source: 'AQICN World Air Quality Index (Real-time)'
    })
  } catch (error) {
    console.error('Error in AQI API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AQI data', data: [] },
      { status: 500 }
    )
  }
}

function getCountryFromCity(city: string): string {
  const countryMap: Record<string, string> = {
    // India
    delhi: 'India', mumbai: 'India', kolkata: 'India', chennai: 'India',
    bangalore: 'India', hyderabad: 'India', pune: 'India', ahmedabad: 'India',
    jaipur: 'India', lucknow: 'India', kanpur: 'India', patna: 'India',
    bhopal: 'India', indore: 'India', nagpur: 'India', surat: 'India',
    varanasi: 'India', agra: 'India', chandigarh: 'India', guwahati: 'India',
    kochi: 'India', thiruvananthapuram: 'India', coimbatore: 'India',
    visakhapatnam: 'India', gurgaon: 'India', noida: 'India', ranchi: 'India',
    raipur: 'India', dehradun: 'India', shimla: 'India', amritsar: 'India',
    ludhiana: 'India', jalandhar: 'India', jodhpur: 'India', udaipur: 'India',
    ajmer: 'India', kota: 'India', gwalior: 'India', jabalpur: 'India',
    allahabad: 'India', meerut: 'India', aligarh: 'India', moradabad: 'India',
    bareilly: 'India', gorakhpur: 'India', faridabad: 'India', ghaziabad: 'India',
    rajkot: 'India', vadodara: 'India', nashik: 'India', aurangabad: 'India',
    solapur: 'India', kolhapur: 'India', hubli: 'India', mysore: 'India',
    mangalore: 'India', belgaum: 'India', gulbarga: 'India', tirupati: 'India',
    vijayawada: 'India', warangal: 'India', guntur: 'India', nellore: 'India',
    madurai: 'India', trichy: 'India', salem: 'India', tirunelveli: 'India',
    erode: 'India', vellore: 'India', bhubaneswar: 'India', cuttack: 'India',
    rourkela: 'India', jamshedpur: 'India', dhanbad: 'India', bokaro: 'India',
    asansol: 'India', durgapur: 'India', siliguri: 'India', agartala: 'India',
    imphal: 'India', shillong: 'India', aizawl: 'India', itanagar: 'India',
    kohima: 'India', gangtok: 'India', srinagar: 'India', jammu: 'India', leh: 'India',
    // China
    beijing: 'China', shanghai: 'China', guangzhou: 'China', shenzhen: 'China',
    hongkong: 'China', chengdu: 'China', wuhan: 'China',
    // Southeast Asia
    bangkok: 'Thailand', jakarta: 'Indonesia', singapore: 'Singapore',
    hanoi: 'Vietnam', kualalumpur: 'Malaysia', manila: 'Philippines', hochiminh: 'Vietnam',
    // Middle East
    dubai: 'UAE', riyadh: 'Saudi Arabia', tehran: 'Iran', doha: 'Qatar', kuwait: 'Kuwait',
    // Europe
    london: 'UK', paris: 'France', berlin: 'Germany', madrid: 'Spain',
    rome: 'Italy', moscow: 'Russia', amsterdam: 'Netherlands', vienna: 'Austria',
    prague: 'Czech Republic', warsaw: 'Poland', brussels: 'Belgium', lisbon: 'Portugal',
    stockholm: 'Sweden', oslo: 'Norway', copenhagen: 'Denmark',
    // Americas
    newyork: 'USA', losangeles: 'USA', chicago: 'USA', houston: 'USA',
    phoenix: 'USA', sanfrancisco: 'USA', seattle: 'USA', denver: 'USA',
    miami: 'USA', boston: 'USA', atlanta: 'USA', dallas: 'USA',
    mexicocity: 'Mexico', saopaulo: 'Brazil', buenosaires: 'Argentina',
    lima: 'Peru', bogota: 'Colombia', santiago: 'Chile',
    toronto: 'Canada', vancouver: 'Canada', montreal: 'Canada',
    // Africa
    cairo: 'Egypt', lagos: 'Nigeria', johannesburg: 'South Africa',
    nairobi: 'Kenya', capetown: 'South Africa', casablanca: 'Morocco',
    // Oceania
    sydney: 'Australia', melbourne: 'Australia', brisbane: 'Australia',
    perth: 'Australia', auckland: 'New Zealand',
    // East Asia
    tokyo: 'Japan', seoul: 'South Korea', osaka: 'Japan', taipei: 'Taiwan', busan: 'South Korea',
    // South Asia
    dhaka: 'Bangladesh', karachi: 'Pakistan', lahore: 'Pakistan',
    islamabad: 'Pakistan', kathmandu: 'Nepal', colombo: 'Sri Lanka'
  }
  
  return countryMap[city.toLowerCase()] || 'Unknown'
}
