'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings, Sun, Moon, Volume2, VolumeX, Bell, MapPin, User, Shield, 
  Palette, Languages, Download, Trash2, LogOut, ChevronRight, Smartphone,
  Eye, BellRing, Vibrate, Zap
} from 'lucide-react'
import { useSound } from '@/hooks/use-sound'

interface UserProfile {
  persona: string
  healthConditions: string[]
}

interface SettingsTabProps {
  userProfile: UserProfile
}

export function SettingsTab({ userProfile }: SettingsTabProps) {
  const { theme, setTheme } = useTheme()
  const { playSound, setEnabled, setVolume } = useSound()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolumeState] = useState([50])
  const [brightness, setBrightness] = useState([100])
  const [vibration, setVibration] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [locationTracking, setLocationTracking] = useState(true)
  const [dataSync, setDataSync] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled)
    setEnabled(enabled)
    if (enabled) {
      playSound('toggle')
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolumeState(value)
    setVolume(value[0] / 100)
    playSound('click')
  }

  const handleBrightnessChange = (value: number[]) => {
    setBrightness(value)
    document.documentElement.style.filter = `brightness(${value[0] / 100})`
  }

  const testSound = (type: 'click' | 'success' | 'warning' | 'alert' | 'notification') => {
    playSound(type)
  }

  const personaLabels: Record<string, string> = {
    'adult': 'General Adult',
    'child-elderly': 'Child / Elderly',
    'athlete': 'Athlete / Outdoor Worker',
  }

  if (!mounted) return null

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground dark:text-white mb-2">Settings</h1>
        <p className="text-muted-foreground dark:text-white/60">Customize your AeroGuard experience</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card className="glass border-emerald-500/20 dark:border-emerald-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
              <User className="w-5 h-5 text-emerald-500" />
              Profile Settings
            </CardTitle>
            <CardDescription className="dark:text-white/60">Manage your health profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground dark:text-white">Current Persona</span>
                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  {personaLabels[userProfile.persona] || userProfile.persona}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground dark:text-white">Health Conditions</span>
                <span className="text-sm text-muted-foreground dark:text-white/60">
                  {userProfile.healthConditions.filter(c => c !== 'none').join(', ') || 'None'}
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full glass border-white/20 text-foreground dark:text-white hover:bg-white/10 bg-transparent">
              <User className="w-4 h-4 mr-2" />
              Update Health Profile
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="glass border-purple-500/20 dark:border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
              <Palette className="w-5 h-5 text-purple-500" />
              Appearance
            </CardTitle>
            <CardDescription className="dark:text-white/60">Customize look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-cyan-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <div>
                  <p className="font-medium text-sm text-foreground dark:text-white">Theme</p>
                  <p className="text-xs text-muted-foreground dark:text-white/50">
                    {theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                  className={theme === 'light' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0' : 'glass border-white/20 bg-transparent'}
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                  className={theme === 'dark' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0' : 'glass border-white/20 bg-transparent'}
                >
                  <Moon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Brightness */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-sm text-foreground dark:text-white">Brightness</p>
                    <p className="text-xs text-muted-foreground dark:text-white/50">{brightness[0]}%</p>
                  </div>
                </div>
              </div>
              <Slider 
                value={brightness}
                onValueChange={handleBrightnessChange}
                max={100}
                min={50}
                step={5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings */}
        <Card className="glass border-cyan-500/20 dark:border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
              <Volume2 className="w-5 h-5 text-cyan-500" />
              Sound & Haptics
            </CardTitle>
            <CardDescription className="dark:text-white/60">Configure audio feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-500" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                <div>
                  <p className="font-medium text-sm text-foreground dark:text-white">Sound Effects</p>
                  <p className="text-xs text-muted-foreground dark:text-white/50">UI interaction sounds</p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={handleSoundToggle} />
            </div>

            {/* Volume */}
            {soundEnabled && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-foreground dark:text-white">Volume</p>
                  <span className="text-sm text-muted-foreground dark:text-white/50">{volume[0]}%</span>
                </div>
                <Slider 
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
            )}

            {/* Test Sounds */}
            {soundEnabled && (
              <div className="space-y-2">
                <p className="font-medium text-sm text-foreground dark:text-white mb-2">Test Sounds</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => testSound('click')}
                    className="glass border-white/20 text-foreground dark:text-white hover:bg-white/10 bg-transparent"
                  >
                    Click
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => testSound('success')}
                    className="glass border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 bg-transparent"
                  >
                    Success
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => testSound('warning')}
                    className="glass border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 bg-transparent"
                  >
                    Warning
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => testSound('alert')}
                    className="glass border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 bg-transparent"
                  >
                    Alert
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => testSound('notification')}
                    className="glass border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 bg-transparent col-span-2"
                  >
                    Notification
                  </Button>
                </div>
              </div>
            )}

            {/* Vibration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vibrate className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-sm text-foreground dark:text-white">Vibration</p>
                  <p className="text-xs text-muted-foreground dark:text-white/50">Haptic feedback</p>
                </div>
              </div>
              <Switch checked={vibration} onCheckedChange={setVibration} />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glass border-amber-500/20 dark:border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
              <Bell className="w-5 h-5 text-amber-500" />
              Notifications
            </CardTitle>
            <CardDescription className="dark:text-white/60">Manage alerts and reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellRing className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-sm text-foreground dark:text-white">Push Notifications</p>
                  <p className="text-xs text-muted-foreground dark:text-white/50">Receive alerts on device</p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cyan-500" />
                <div>
                  <p className="font-medium text-sm text-foreground dark:text-white">Location Tracking</p>
                  <p className="text-xs text-muted-foreground dark:text-white/50">Auto-detect your location</p>
                </div>
              </div>
              <Switch checked={locationTracking} onCheckedChange={setLocationTracking} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium text-sm text-foreground dark:text-white">Auto Refresh</p>
                  <p className="text-xs text-muted-foreground dark:text-white/50">Update data every 5 minutes</p>
                </div>
              </div>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-sm text-foreground dark:text-white">Data Sync</p>
                  <p className="text-xs text-muted-foreground dark:text-white/50">Sync across devices</p>
                </div>
              </div>
              <Switch checked={dataSync} onCheckedChange={setDataSync} />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="glass border-red-500/20 dark:border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
              <Shield className="w-5 h-5 text-red-500" />
              Data & Privacy
            </CardTitle>
            <CardDescription className="dark:text-white/60">Manage your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start glass border-white/20 text-foreground dark:text-white hover:bg-white/10 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export My Data
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="outline" className="w-full justify-start glass border-white/20 text-foreground dark:text-white hover:bg-white/10 bg-transparent">
              <Languages className="w-4 h-4 mr-2" />
              Language: English
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="outline" className="w-full justify-start glass border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 bg-transparent">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="outline" className="w-full justify-start glass border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 bg-transparent">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="glass border-emerald-500/20 dark:border-emerald-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
              <Settings className="w-5 h-5 text-emerald-500" />
              About AeroGuard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground dark:text-white/60">Version</span>
              <span className="text-sm font-medium text-foreground dark:text-white">1.0.0 (Hack-AI-Thon)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground dark:text-white/60">Last Updated</span>
              <span className="text-sm font-medium text-foreground dark:text-white">January 31, 2026</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground dark:text-white/60">Data Source</span>
              <span className="text-sm font-medium text-foreground dark:text-white">CPCB & MPCB</span>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-center text-muted-foreground dark:text-white/50">
                Built for Hack-AI-Thon 2026 - Hyper-Local Air Quality & Health Risk Forecaster
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
