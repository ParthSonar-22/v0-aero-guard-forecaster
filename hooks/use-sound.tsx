'use client'

import React from "react"

import { useCallback, useRef, useEffect, useState, createContext, useContext } from 'react'

type SoundType = 'click' | 'success' | 'warning' | 'alert' | 'notification' | 'toggle' | 'hover' | 'error'

interface SoundContextType {
  playSound: (type: SoundType) => void
  vibrate: (pattern?: number | number[]) => void
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
  setVibrationEnabled: (enabled: boolean) => void
  enabled: boolean
  vibrationEnabled: boolean
  volume: number
}

const SoundContext = createContext<SoundContextType | null>(null)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const [enabled, setEnabledState] = useState(true)
  const [vibrationEnabled, setVibrationEnabledState] = useState(true)
  const [volume, setVolumeState] = useState(0.5)

  useEffect(() => {
    // Load settings from localStorage
    const savedEnabled = localStorage.getItem('soundEnabled')
    const savedVibration = localStorage.getItem('vibrationEnabled')
    const savedVolume = localStorage.getItem('soundVolume')
    
    if (savedEnabled !== null) setEnabledState(savedEnabled === 'true')
    if (savedVibration !== null) setVibrationEnabledState(savedVibration === 'true')
    if (savedVolume !== null) setVolumeState(parseFloat(savedVolume))
  }, [])

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled) return

    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch {
      // Audio not supported
    }
  }, [getAudioContext, enabled, volume])

  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (!vibrationEnabled) return
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern)
      }
    } catch {
      // Vibration not supported
    }
  }, [vibrationEnabled])

  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return
    
    // Also vibrate on certain sounds
    if (vibrationEnabled) {
      switch (type) {
        case 'click':
          vibrate(30)
          break
        case 'success':
          vibrate([50, 30, 50])
          break
        case 'error':
        case 'alert':
          vibrate([100, 50, 100, 50, 100])
          break
        case 'notification':
          vibrate([50, 50, 50])
          break
        case 'toggle':
          vibrate(20)
          break
        default:
          vibrate(30)
      }
    }

    switch (type) {
      case 'click':
        playTone(800, 0.05, 'square')
        break
      case 'hover':
        playTone(1200, 0.02, 'sine')
        break
      case 'success':
        playTone(523, 0.1, 'sine')
        setTimeout(() => playTone(659, 0.1, 'sine'), 100)
        setTimeout(() => playTone(784, 0.15, 'sine'), 200)
        break
      case 'warning':
        playTone(440, 0.15, 'triangle')
        setTimeout(() => playTone(440, 0.15, 'triangle'), 200)
        break
      case 'alert':
        playTone(880, 0.1, 'sawtooth')
        setTimeout(() => playTone(660, 0.1, 'sawtooth'), 150)
        setTimeout(() => playTone(880, 0.1, 'sawtooth'), 300)
        break
      case 'error':
        playTone(200, 0.2, 'sawtooth')
        setTimeout(() => playTone(150, 0.3, 'sawtooth'), 200)
        break
      case 'notification':
        playTone(587, 0.08, 'sine')
        setTimeout(() => playTone(784, 0.12, 'sine'), 100)
        break
      case 'toggle':
        playTone(600, 0.04, 'square')
        break
    }
  }, [playTone, enabled, vibrate, vibrationEnabled])

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    localStorage.setItem('soundEnabled', String(value))
  }, [])

  const setVibrationEnabled = useCallback((value: boolean) => {
    setVibrationEnabledState(value)
    localStorage.setItem('vibrationEnabled', String(value))
  }, [])

  const setVolume = useCallback((value: number) => {
    const v = Math.max(0, Math.min(1, value))
    setVolumeState(v)
    localStorage.setItem('soundVolume', String(v))
  }, [])

  return (
    <SoundContext.Provider value={{ 
      playSound, 
      vibrate, 
      setEnabled, 
      setVolume, 
      setVibrationEnabled,
      enabled,
      vibrationEnabled,
      volume
    }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)
  
  // Fallback for when used outside provider
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch {
      // Audio not supported
    }
  }, [getAudioContext])

  const fallbackPlaySound = useCallback((type: SoundType) => {
    switch (type) {
      case 'click':
        playTone(800, 0.05, 'square')
        break
      case 'success':
        playTone(523, 0.1, 'sine')
        setTimeout(() => playTone(659, 0.1, 'sine'), 100)
        setTimeout(() => playTone(784, 0.15, 'sine'), 200)
        break
      case 'toggle':
        playTone(600, 0.04, 'square')
        break
      default:
        playTone(600, 0.05, 'square')
    }
  }, [playTone])

  const fallbackVibrate = useCallback((pattern: number | number[] = 50) => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern)
      }
    } catch {
      // Vibration not supported
    }
  }, [])

  if (context) return context

  return {
    playSound: fallbackPlaySound,
    vibrate: fallbackVibrate,
    setEnabled: () => {},
    setVolume: () => {},
    setVibrationEnabled: () => {},
    enabled: true,
    vibrationEnabled: true,
    volume: 0.5
  }
}
