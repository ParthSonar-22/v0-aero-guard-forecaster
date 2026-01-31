'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, LogOut, User } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ThemeToggle } from './theme-toggle'
import { useSound } from '@/hooks/use-sound'

interface UserData {
  name: string
  email: string
}

export function Navbar() {
  const router = useRouter()
  const { playSound, vibrate } = useSound()
  const [location, setLocation] = useState('Detecting...')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    setTimeout(() => {
      setLocation('Mumbai, India')
    }, 1500)

    const user = localStorage.getItem('user')
    if (user) {
      setIsAuthenticated(true)
      setUserData(JSON.parse(user))
    }

    // Update greeting based on time
    const updateGreeting = () => {
      const hour = new Date().getHours()
      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      setCurrentTime(time)
      
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning')
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon')
      } else if (hour >= 17 && hour < 21) {
        setGreeting('Good Evening')
      } else {
        setGreeting('Good Night')
      }
    }

    updateGreeting()
    const interval = setInterval(updateGreeting, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleAuthClick = () => {
    playSound('click')
    vibrate(30)
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/signup')
    }
  }

  const handleLogout = () => {
    playSound('notification')
    vibrate([50, 30, 50])
    localStorage.removeItem('user')
    localStorage.removeItem('userProfile')
    localStorage.setItem('needsOnboarding', 'true')
    setIsAuthenticated(false)
    router.push('/')
  }

  const handleLogoClick = () => {
    playSound('click')
    vibrate(20)
    router.push('/')
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-emerald-500/20 dark:border-white/10 glass">
      <div className="container flex h-16 items-center justify-between px-4">
        <button onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer group">
          <img 
            src="/images/pngtree-eco-life-nature-simple-icon-logo-png-image-7114913.png" 
            alt="AeroGuard Logo" 
            className="w-10 h-10 group-hover:scale-110 transition-transform"
          />
          <span className="text-xl font-bold gradient-text hidden sm:block">AeroGuard</span>
        </button>
        
        <div className="flex items-center gap-3">
          {/* Greeting for authenticated users */}
          {isAuthenticated && userData && (
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs text-muted-foreground dark:text-white/50">{currentTime}</span>
              <span className="text-sm font-medium text-foreground dark:text-white">
                {greeting}, <span className="gradient-text">{userData.name.split(' ')[0]}</span>
              </span>
            </div>
          )}

          <Badge className="gap-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 rounded-full px-4 py-2 hidden sm:flex">
            <MapPin className="h-3.5 w-3.5 animate-pulse" />
            <span className="text-xs font-semibold">{location}</span>
          </Badge>

          <ThemeToggle />
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Profile Avatar */}
              <button
                onClick={() => { playSound('click'); router.push('/dashboard?tab=settings') }}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30"
              >
                {userData ? getInitials(userData.name) : <User className="h-4 w-4" />}
              </button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { playSound('click'); router.push('/dashboard') }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 font-semibold hidden sm:flex"
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="glass border-emerald-500/30 dark:border-white/20 text-foreground dark:text-white hover:bg-emerald-500/10 dark:hover:bg-white/10 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAuthClick}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 font-semibold"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
