'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AQIChart } from '@/components/aqi-chart'
import { SafetySuggestion } from '@/components/safety-suggestion'
import { PollutionPieChart } from '@/components/pollution-pie-chart'
import { MumbaiPollutionMap } from '@/components/mumbai-pollution-map'
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HealthChatbot } from '@/components/health-chatbot'
import { AnalyticsTab } from '@/components/analytics-tab'
import { AlertsTab } from '@/components/alerts-tab'
import { SettingsTab } from '@/components/settings-tab'
import { AnimatedBackground } from '@/components/animated-background'
import { HourlyForecast } from '@/components/hourly-forecast'
import { useMumbaiAQI, useAllCitiesAQI, useCityForecast } from '@/hooks/use-live-aqi'
import { getAQIStatus as getLiveAQIStatus, getHealthRecommendation } from '@/lib/aqi-service'

interface UserProfile {
  persona: string
  healthConditions: string[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [currentAQI, setCurrentAQI] = useState(168)
  const [isSafeToGoOut, setIsSafeToGoOut] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check if user is authenticated and has profile
    const user = localStorage.getItem('user')
    const needsOnboarding = localStorage.getItem('needsOnboarding')
    
    if (!user) {
      router.push('/signin')
      return
    }
    
    if (needsOnboarding === 'true') {
      router.push('/onboarding')
      return
    }

    const profile = localStorage.getItem('userProfile')
    if (profile) {
      const parsedProfile = JSON.parse(profile)
      setUserProfile(parsedProfile)
      
      // Calculate safety based on persona and health
      const safe = calculateSafety(currentAQI, parsedProfile)
      setIsSafeToGoOut(safe)
    }

    // Get user name
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUserName(parsed.name?.split(' ')[0] || 'User')
    }

    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning')
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon')
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good Evening')
    } else {
      setGreeting('Good Night')
    }
  }, [router, currentAQI])

  const calculateSafety = (aqi: number, profile: UserProfile) => {
    const hasHealthIssues = profile.healthConditions.some(c => c !== 'none')
    
    if (profile.persona === 'child-elderly' || hasHealthIssues) {
      return aqi <= 50
    } else if (profile.persona === 'athlete') {
      return aqi <= 100
    } else {
      return aqi <= 150
    }
  }

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'bg-primary text-primary-foreground', textColor: 'text-primary' }
    if (aqi <= 100) return { label: 'Moderate', color: 'bg-secondary text-secondary-foreground', textColor: 'text-secondary' }
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'bg-accent text-accent-foreground', textColor: 'text-accent' }
    if (aqi <= 200) return { label: 'Unhealthy', color: 'bg-destructive text-destructive-foreground', textColor: 'text-destructive' }
    return { label: 'Very Unhealthy', color: 'bg-destructive text-destructive-foreground', textColor: 'text-destructive' }
  }

  const status = getAQIStatus(currentAQI)

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/10">
        <Navbar />
        <main className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading your dashboard...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen cosmic-bg relative">
      <AnimatedBackground />
      <Navbar />
      <HealthChatbot />
      <div className="flex">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {greeting}, <span className="gradient-text">{userName}</span>
                </h1>
                <p className="text-muted-foreground">Mumbai, India - Personalized for {userProfile.persona.replace('-', ' / ')}</p>
              </div>

              {/* Safety Status Card */}
              <Card className={cn(
                "mb-6 glass border-2",
                isSafeToGoOut ? "border-primary/50" : "border-destructive/50"
              )}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {isSafeToGoOut ? (
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                      ) : (
                        <XCircle className="h-12 w-12 text-destructive" />
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                          {isSafeToGoOut ? 'Safe to Go Out' : 'Stay Indoors'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {isSafeToGoOut 
                            ? 'Current air quality is acceptable for outdoor activities'
                            : 'Air quality may be harmful, especially for sensitive groups'
                          }
                        </p>
                      </div>
                    </div>
                    <Badge className={cn("text-lg px-4 py-2", status.color)}>
                      AQI: {currentAQI}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card className="glass border-border/20">
                  <CardHeader className="pb-3">
                    <CardDescription>Current Status</CardDescription>
                    <CardTitle className={cn("text-2xl font-bold", status.textColor)}>
                      {status.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Based on AQI {currentAQI}</p>
                  </CardContent>
                </Card>

                <Card className="glass border-border/20">
                  <CardHeader className="pb-3">
                    <CardDescription>PM2.5 Level</CardDescription>
                    <CardTitle className="text-2xl font-bold text-accent">89 µg/m³</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Above safe limit</p>
                  </CardContent>
                </Card>

                <Card className="glass border-border/20">
                  <CardHeader className="pb-3">
                    <CardDescription>PM10 Level</CardDescription>
                    <CardTitle className="text-2xl font-bold text-secondary">124 µg/m³</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Moderate concern</p>
                  </CardContent>
                </Card>

                <Card className="glass border-border/20">
                  <CardHeader className="pb-3">
                    <CardDescription>12h Forecast</CardDescription>
                    <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                      <TrendingUp className="h-6 w-6" />
                      185
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Expected to worsen</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-3 mb-6">
                <Card className="lg:col-span-2 glass border-border/20">
                  <CardHeader>
                    <CardTitle>12-Hour AQI Forecast</CardTitle>
                    <CardDescription>Temporal Prediction Engine for Mumbai</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AQIChart />
                  </CardContent>
                </Card>

                <SafetySuggestion userProfile={userProfile} currentAQI={currentAQI} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2 mb-6">
                <Card className="glass border-border/20">
                  <CardHeader>
                    <CardTitle>Pollutant Composition</CardTitle>
                    <CardDescription>Current air quality breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PollutionPieChart />
                  </CardContent>
                </Card>

                <Card className="glass border-border/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      Why This Matters
                    </CardTitle>
                    <CardDescription>Personalized health insights</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                      <h4 className="font-semibold text-foreground mb-2">Environmental Factors</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        High AQI in Mumbai today is due to vehicular emissions, construction dust, and low wind speeds. 
                        The monsoon season has ended, leading to increased particulate matter accumulation.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                      <h4 className="font-semibold text-foreground mb-2">For Your Profile</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        As a <span className="font-medium text-foreground">{userProfile.persona.replace('-', ' / ')}</span>
                        {userProfile.healthConditions.length > 0 && userProfile.healthConditions[0] !== 'none' && (
                          <span> with {userProfile.healthConditions.join(', ')}</span>
                        )}, prolonged exposure to current AQI levels can cause respiratory irritation and reduced lung function.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card/50 border border-border/30">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-accent" />
                        Recommendation
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {isSafeToGoOut 
                          ? 'You can go outside but consider reducing intense outdoor activities.'
                          : 'Stay indoors, use air purifiers, and wear N95 masks if you must go out.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'map' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Mumbai Pollution Map</h1>
                <p className="text-muted-foreground">Real-time air quality across different areas</p>
              </div>
              
              <Card className="glass border-border/20 mb-6">
                <CardHeader>
                  <CardTitle>Interactive Pollution Heatmap</CardTitle>
                  <CardDescription>Click markers to see detailed AQI information for each area</CardDescription>
                </CardHeader>
                <CardContent>
                  <MumbaiPollutionMap />
                  
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-[#0f766e]" />
                      <span className="text-sm">Good (0-50)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-[#0ea5e9]" />
                      <span className="text-sm">Moderate (51-100)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-[#f59e0b]" />
                      <span className="text-sm">Unhealthy (101-150)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-[#ef4444]" />
                      <span className="text-sm">Very Unhealthy (151-200)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-[#7c2d12]" />
                      <span className="text-sm">Hazardous (201+)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 12-Hour Forecast Section */}
              <Card className="glass border-border/20">
                <CardHeader>
                  <CardTitle>12-Hour AQI Forecast</CardTitle>
                  <CardDescription>Click on any hour to see detailed weather and air quality predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <HourlyForecast />
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab currentAQI={currentAQI} />
          )}

          {activeTab === 'alerts' && (
            <AlertsTab userProfile={userProfile} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab userProfile={userProfile} />
          )}
        </main>
      </div>
    </div>
  )
}
