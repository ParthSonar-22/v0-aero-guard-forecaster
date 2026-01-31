'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Bell, AlertTriangle, CheckCircle2, Info, X, Clock, MapPin, Shield, Zap } from 'lucide-react'
import { useSound } from '@/hooks/use-sound'

interface UserProfile {
  persona: string
  healthConditions: string[]
}

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  title: string
  message: string
  time: string
  location?: string
  read: boolean
}

const initialAlerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'AQI Spike Detected',
    message: 'Air quality in Andheri has reached unhealthy levels (AQI 195). Avoid outdoor activities.',
    time: '10 minutes ago',
    location: 'Andheri, Mumbai',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Evening Peak Hours Alert',
    message: 'Traffic emissions expected to increase AQI between 5-8 PM. Plan indoor activities.',
    time: '1 hour ago',
    location: 'Mumbai Metropolitan',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Weather Advisory',
    message: 'Low wind speeds forecasted for tomorrow. Air quality may remain stagnant.',
    time: '3 hours ago',
    read: false,
  },
  {
    id: '4',
    type: 'success',
    title: 'Air Quality Improved',
    message: 'Colaba area shows improved air quality (AQI 85). Safe for outdoor activities.',
    time: '5 hours ago',
    location: 'Colaba, Mumbai',
    read: true,
  },
  {
    id: '5',
    type: 'warning',
    title: 'Construction Activity',
    message: 'Increased dust levels expected due to nearby construction work.',
    time: 'Yesterday',
    location: 'Bandra, Mumbai',
    read: true,
  },
]

const alertPreferences = [
  { id: 'critical', label: 'Critical Alerts', description: 'AQI above 200', enabled: true },
  { id: 'unhealthy', label: 'Unhealthy Warnings', description: 'AQI above 150', enabled: true },
  { id: 'forecast', label: 'Forecast Alerts', description: 'Daily predictions', enabled: true },
  { id: 'location', label: 'Location-based', description: 'Alerts for saved locations', enabled: false },
  { id: 'health', label: 'Health Reminders', description: 'Medication and activity reminders', enabled: true },
]

interface AlertsTabProps {
  userProfile: UserProfile
}

export function AlertsTab({ userProfile }: AlertsTabProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [preferences, setPreferences] = useState(alertPreferences)
  const { playSound } = useSound()

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'info':
        return <Info className="w-5 h-5 text-cyan-500" />
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getAlertBorder = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-4 border-l-red-500'
      case 'warning':
        return 'border-l-4 border-l-amber-500'
      case 'info':
        return 'border-l-4 border-l-cyan-500'
      case 'success':
        return 'border-l-4 border-l-emerald-500'
      default:
        return ''
    }
  }

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a))
  }

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  const togglePreference = (id: string) => {
    setPreferences(preferences.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p))
  }

  const unreadCount = alerts.filter(a => !a.read).length

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground dark:text-white mb-2">Air Quality Alerts</h1>
        <p className="text-muted-foreground dark:text-white/60">
          Stay informed about air quality changes in Mumbai
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-red-500/20 text-red-500 border-red-500/30">
              {unreadCount} new
            </Badge>
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass border-emerald-500/20 dark:border-emerald-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
                  <Bell className="w-5 h-5 text-emerald-500" />
                  Recent Alerts
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAlerts(alerts.map(a => ({ ...a, read: true })))}
                  className="glass border-white/20 text-foreground dark:text-white hover:bg-white/10 bg-transparent"
                >
                  Mark all read
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg glass ${getAlertBorder(alert.type)} ${!alert.read ? 'bg-white/5' : 'opacity-70'}`}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground dark:text-white">{alert.title}</h4>
                          {!alert.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-white/70 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground dark:text-white/50">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alert.time}
                          </span>
                          {alert.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {alert.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id) }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Alert Preferences */}
        <div className="space-y-4">
          <Card className="glass border-cyan-500/20 dark:border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
                <Shield className="w-5 h-5 text-cyan-500" />
                Alert Preferences
              </CardTitle>
              <CardDescription className="dark:text-white/60">Customize your notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {preferences.map((pref) => (
                <div key={pref.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground dark:text-white">{pref.label}</p>
                    <p className="text-xs text-muted-foreground dark:text-white/50">{pref.description}</p>
                  </div>
                  <Switch 
                    checked={pref.enabled}
                    onCheckedChange={() => togglePreference(pref.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass border-amber-500/20 dark:border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
                <Zap className="w-5 h-5 text-amber-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => playSound('alert')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
              >
                Test Alert Sound
              </Button>
              <Button variant="outline" className="w-full glass border-white/20 text-foreground dark:text-white hover:bg-white/10 bg-transparent">
                View Alert History
              </Button>
              <Button variant="outline" className="w-full glass border-white/20 text-foreground dark:text-white hover:bg-white/10 bg-transparent">
                Export Alerts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
