'use client'

import * as React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { useSound } from '@/hooks/use-sound'

interface SoundButtonProps extends ButtonProps {
  soundType?: 'click' | 'success' | 'warning' | 'alert' | 'notification' | 'toggle'
  vibratePattern?: number | number[]
}

export const SoundButton = React.forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ onClick, soundType = 'click', vibratePattern = 30, children, ...props }, ref) => {
    const { playSound, vibrate } = useSound()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playSound(soundType)
      vibrate(vibratePattern)
      onClick?.(e)
    }

    return (
      <Button ref={ref} onClick={handleClick} {...props}>
        {children}
      </Button>
    )
  }
)

SoundButton.displayName = 'SoundButton'
