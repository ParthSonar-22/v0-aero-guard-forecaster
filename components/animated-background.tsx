'use client'

import { useEffect, useState, useRef } from 'react'
import { useTheme } from 'next-themes'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  type: 'circle' | 'square' | 'triangle' | 'dot'
  opacity: number
}

interface GlowOrb {
  id: number
  x: number
  y: number
  size: number
  color: string
  colorLight: string
  delay: number
}

interface FloatingIcon {
  id: number
  x: number
  y: number
  icon: string
  size: number
  duration: number
  delay: number
}

export function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [glowOrbs, setGlowOrbs] = useState<GlowOrb[]>([])
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const { resolvedTheme } = useTheme()
  const rafRef = useRef<number>()

  useEffect(() => {
    // Track mouse for interactive glow effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    // Generate more dynamic particles
    const newParticles: Particle[] = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 3,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 15,
      type: ['circle', 'square', 'triangle', 'dot'][Math.floor(Math.random() * 4)] as 'circle' | 'square' | 'triangle' | 'dot',
      opacity: Math.random() * 0.4 + 0.2
    }))
    setParticles(newParticles)

    // Generate glow orbs with theme variants
    const newOrbs: GlowOrb[] = [
      { id: 0, x: 10, y: 20, size: 350, color: 'rgba(16, 185, 129, 0.18)', colorLight: 'rgba(16, 185, 129, 0.08)', delay: 0 },
      { id: 1, x: 85, y: 60, size: 280, color: 'rgba(14, 165, 233, 0.18)', colorLight: 'rgba(14, 165, 233, 0.08)', delay: 2 },
      { id: 2, x: 50, y: 85, size: 220, color: 'rgba(245, 158, 11, 0.12)', colorLight: 'rgba(245, 158, 11, 0.05)', delay: 4 },
      { id: 3, x: 15, y: 75, size: 200, color: 'rgba(34, 211, 238, 0.15)', colorLight: 'rgba(34, 211, 238, 0.06)', delay: 1 },
      { id: 4, x: 92, y: 25, size: 250, color: 'rgba(16, 185, 129, 0.15)', colorLight: 'rgba(16, 185, 129, 0.06)', delay: 3 },
      { id: 5, x: 40, y: 30, size: 180, color: 'rgba(139, 92, 246, 0.12)', colorLight: 'rgba(139, 92, 246, 0.05)', delay: 5 },
    ]
    setGlowOrbs(newOrbs)

    // Air quality themed floating icons
    const icons = ['wind', 'leaf', 'cloud', 'droplet', 'sun']
    const newIcons: FloatingIcon[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      icon: icons[Math.floor(Math.random() * icons.length)],
      size: Math.random() * 20 + 15,
      duration: Math.random() * 30 + 20,
      delay: Math.random() * 10
    }))
    setFloatingIcons(newIcons)
  }, [])

  const isDark = resolvedTheme === 'dark'

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Interactive mouse-following glow */}
      <div 
        className="absolute w-96 h-96 rounded-full transition-all duration-1000 ease-out"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: 'translate(-50%, -50%)',
          background: isDark 
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />

      

      {/* Glow orbs */}
      {glowOrbs.map((orb) => (
        <div
          key={orb.id}
          className="glow-orb"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: isDark ? orb.color : orb.colorLight,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            opacity: isDark ? particle.opacity : particle.opacity * 0.5
          }}
        >
          {particle.type === 'circle' && (
            <div 
              className="rounded-full bg-emerald-500/40 dark:bg-emerald-400/40"
              style={{ width: particle.size, height: particle.size }}
            />
          )}
          {particle.type === 'square' && (
            <div 
              className="rotate-45 bg-cyan-500/40 dark:bg-cyan-400/40"
              style={{ width: particle.size, height: particle.size }}
            />
          )}
          {particle.type === 'triangle' && (
            <div 
              style={{ 
                width: 0,
                height: 0,
                borderLeftWidth: particle.size / 2,
                borderRightWidth: particle.size / 2,
                borderBottomWidth: particle.size,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.25)'
              }}
            />
          )}
          {particle.type === 'dot' && (
            <div 
              className="rounded-full bg-white/30 dark:bg-white/40"
              style={{ width: particle.size / 2, height: particle.size / 2 }}
            />
          )}
        </div>
      ))}

      {/* Floating air quality icons */}
      {floatingIcons.map((icon) => (
        <div
          key={icon.id}
          className="absolute opacity-10 dark:opacity-20"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            animation: `float ${icon.duration}s ease-in-out infinite`,
            animationDelay: `${icon.delay}s`
          }}
        >
          <svg 
            width={icon.size} 
            height={icon.size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            className="text-emerald-500 dark:text-emerald-400"
          >
            {icon.icon === 'wind' && <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2m9.6-7.4a2 2 0 1 1 1.4 3.4H2m7.6 11.4a2 2 0 1 0 1.4-3.4H2" />}
            {icon.icon === 'leaf' && <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />}
            {icon.icon === 'cloud' && <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />}
            {icon.icon === 'droplet' && <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />}
            {icon.icon === 'sun' && <circle cx="12" cy="12" r="4" />}
          </svg>
        </div>
      ))}

      

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  )
}
