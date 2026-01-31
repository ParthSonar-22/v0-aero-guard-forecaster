'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useSound } from '@/hooks/use-sound'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const { playSound, vibrate } = useSound()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    playSound('toggle')
    vibrate(40)
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) {
    return (
      <button className="h-11 w-11 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/30 flex items-center justify-center">
        <Sun className="h-5 w-5 text-amber-500" />
      </button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={handleToggle}
      className={`relative h-11 w-11 rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-110 active:scale-95 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900 border-2 border-emerald-400/60 shadow-xl shadow-emerald-500/30' 
          : 'bg-gradient-to-br from-amber-300 via-orange-400 to-yellow-500 border-2 border-amber-200 shadow-xl shadow-amber-500/40'
      }`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-emerald-500/20' : 'bg-white/30'} animate-pulse`} />
      {isDark ? (
        <Moon className="h-5 w-5 text-emerald-300 relative z-10 drop-shadow-lg" />
      ) : (
        <Sun className="h-5 w-5 text-white relative z-10 drop-shadow-lg animate-spin-slow" />
      )}
    </button>
  )
}
