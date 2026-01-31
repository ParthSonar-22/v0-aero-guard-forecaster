'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export interface CityAQI {
  city: string
  aqi: number
  status: string
  color: string
  bgColor: string
  pm25: number
  pm10: number
  temperature: number
  humidity: number
  coordinates: { lat: number; lng: number }
  lastUpdated: string
}

export interface MumbaiAreaAQI {
  name: string
  area: string
  aqi: number
  status: string
  color: string
  bgColor: string
  coordinates: { lat: number; lng: number }
  pm25: number
  pm10: number
  temperature: number
  humidity: number
  lastUpdated: string
}

export interface ForecastHour {
  hour: string
  aqi: number
  temp: number
  humidity: number
  status: string
  color: string
}

// Fetch all Indian metro cities AQI
export function useAllCitiesAQI() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    type: string
    data: CityAQI[]
    mostPolluted: CityAQI
    leastPolluted: CityAQI
    lastUpdated: string
  }>('/api/aqi?type=all', fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
  })

  return {
    cities: data?.data || [],
    mostPolluted: data?.mostPolluted,
    leastPolluted: data?.leastPolluted,
    lastUpdated: data?.lastUpdated,
    isLoading,
    isError: error,
    refresh: mutate
  }
}

// Fetch Mumbai area-specific AQI
export function useMumbaiAQI() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    type: string
    data: MumbaiAreaAQI[]
    cityAverage: number
    lastUpdated: string
  }>('/api/aqi?type=mumbai', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds for local data
    revalidateOnFocus: true,
  })

  return {
    areas: data?.data || [],
    cityAverage: data?.cityAverage || 0,
    lastUpdated: data?.lastUpdated,
    isLoading,
    isError: error,
    refresh: mutate
  }
}

// Fetch specific city AQI
export function useCityAQI(city: string) {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    data: CityAQI
  }>(city ? `/api/aqi?city=${encodeURIComponent(city)}` : null, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })

  return {
    cityData: data?.data,
    isLoading,
    isError: error,
    refresh: mutate
  }
}

// Fetch 12-hour forecast for a city
export function useCityForecast(city: string) {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    city: string
    forecast: ForecastHour[]
    lastUpdated: string
  }>(city ? `/api/aqi?type=forecast&city=${encodeURIComponent(city)}` : null, fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes for forecast
    revalidateOnFocus: true,
  })

  return {
    forecast: data?.forecast || [],
    lastUpdated: data?.lastUpdated,
    isLoading,
    isError: error,
    refresh: mutate
  }
}
