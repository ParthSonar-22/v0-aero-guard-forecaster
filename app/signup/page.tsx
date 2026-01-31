'use client'

import type React from "react"
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { AnimatedBackground } from '@/components/animated-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Mail, Lock, User, Phone, MapPin, Calendar, Heart, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { useSound } from '@/hooks/use-sound'

export default function SignUpPage() {
  const router = useRouter()
  const { playSound, vibrate } = useSound()
  const [step, setStep] = useState(1) // 1: Basic info, 2: Verification, 3: Additional info
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerified, setIsVerified] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [demoCode, setDemoCode] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    age: '',
    healthConditions: [] as string[],
  })

  const healthOptions = [
    'Asthma',
    'Heart Disease',
    'Respiratory Issues',
    'Allergies',
    'Diabetes',
    'Elderly Care',
    'Pregnant',
    'None'
  ]

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const toggleHealthCondition = (condition: string) => {
    playSound('click')
    vibrate(20)
    if (condition === 'None') {
      setFormData({ ...formData, healthConditions: ['None'] })
    } else {
      const filtered = formData.healthConditions.filter(c => c !== 'None')
      if (filtered.includes(condition)) {
        setFormData({ ...formData, healthConditions: filtered.filter(c => c !== condition) })
      } else {
        setFormData({ ...formData, healthConditions: [...filtered, condition] })
      }
    }
  }

  const sendVerificationCode = async () => {
    playSound('click')
    vibrate(30)
    setIsSending(true)
    setVerificationError('')
    
    try {
      const identifier = verificationMethod === 'email' ? formData.email : formData.phone
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          [verificationMethod]: identifier
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        playSound('success')
        vibrate([50, 30, 50])
        setCountdown(60) // 60 second countdown for resend
        setDemoCode(data.demoCode || '') // Demo only - shows the code
        setStep(2)
      } else {
        playSound('error')
        setVerificationError(data.message)
      }
    } catch {
      playSound('error')
      setVerificationError('Failed to send verification code. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedCode.forEach((char, i) => {
        if (i < 6) newOtp[i] = char
      })
      setOtp(newOtp)
      otpRefs.current[5]?.focus()
      return
    }
    
    if (!/^\d*$/.test(value)) return // Only allow digits
    
    playSound('click')
    vibrate(10)
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const verifyCode = async () => {
    playSound('click')
    vibrate(30)
    setIsVerifying(true)
    setVerificationError('')
    
    const code = otp.join('')
    if (code.length !== 6) {
      setVerificationError('Please enter the complete 6-digit code')
      setIsVerifying(false)
      return
    }
    
    try {
      const identifier = verificationMethod === 'email' ? formData.email : formData.phone
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          [verificationMethod]: identifier,
          code
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.verified) {
        playSound('success')
        vibrate([100, 50, 100])
        setIsVerified(true)
        setTimeout(() => {
          setStep(3)
        }, 1500)
      } else {
        playSound('error')
        vibrate([100, 50, 100, 50, 100])
        setVerificationError(data.message)
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
      }
    } catch {
      playSound('error')
      setVerificationError('Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    playSound('click')
    vibrate(30)
    
    if (!formData.name || !formData.email || !formData.password) {
      return
    }
    
    // Go to verification
    sendVerificationCode()
  }

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    playSound('success')
    vibrate([50, 30, 50, 30, 50])
    
    localStorage.setItem('user', JSON.stringify({ 
      name: formData.name, 
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      age: formData.age,
      healthConditions: formData.healthConditions,
      verified: true,
      verifiedVia: verificationMethod
    }))
    localStorage.setItem('needsOnboarding', 'true')
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen cosmic-bg flex flex-col relative">
      <AnimatedBackground />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <Card className="w-full max-w-md glass border-emerald-500/20 dark:border-white/10 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-2">
            <div className={`mx-auto p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 w-fit border border-emerald-500/30 ${isVerified ? '' : 'animate-pulse-glow'}`}>
              {isVerified ? (
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              ) : (
                <Shield className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground dark:text-white">
                {step === 1 && 'Join AeroGuard'}
                {step === 2 && (isVerified ? 'Verified!' : 'Verify Your Account')}
                {step === 3 && 'Complete Your Profile'}
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-white/60 mt-2">
                {step === 1 && 'Create your account to get started'}
                {step === 2 && (isVerified ? 'Your account has been verified' : `Enter the code sent to your ${verificationMethod}`)}
                {step === 3 && 'Tell us more about yourself'}
              </CardDescription>
            </div>
            {/* Progress indicator */}
            <div className="flex justify-center gap-2">
              <div className={`h-2 w-12 rounded-full transition-all ${step >= 1 ? 'bg-emerald-500' : 'bg-white/20'}`} />
              <div className={`h-2 w-12 rounded-full transition-all ${step >= 2 ? 'bg-emerald-500' : 'bg-white/20'}`} />
              <div className={`h-2 w-12 rounded-full transition-all ${step >= 3 ? 'bg-emerald-500' : 'bg-white/20'}`} />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground/80 dark:text-white/80">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/40" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 bg-white/50 dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground/80 dark:text-white/80">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-white/50 dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground/80 dark:text-white/80">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/40" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 bg-white/50 dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground/80 dark:text-white/80">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/40" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 bg-white/50 dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Verification method selection */}
                <div className="space-y-2">
                  <Label className="text-foreground/80 dark:text-white/80">Verify via</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setVerificationMethod('email'); playSound('click') }}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                        verificationMethod === 'email'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/10 dark:bg-white/5 text-foreground dark:text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => { setVerificationMethod('phone'); playSound('click') }}
                      disabled={!formData.phone}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                        verificationMethod === 'phone'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/10 dark:bg-white/5 text-foreground dark:text-white/70 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <Phone className="h-4 w-4" />
                      Phone
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 font-semibold" 
                  size="lg"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-6">
                {!isVerified ? (
                  <>
                    {/* Demo code display - Remove in production */}
                    {demoCode && (
                      <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/30 text-center">
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Demo Mode - Your code is:</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-widest">{demoCode}</p>
                      </div>
                    )}

                    <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpRefs.current[index] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/50 dark:bg-white/5 border-2 border-emerald-500/30 dark:border-white/20 text-foreground dark:text-white focus:border-emerald-500 focus:outline-none transition-all"
                        />
                      ))}
                    </div>

                    {verificationError && (
                      <p className="text-red-500 text-sm text-center">{verificationError}</p>
                    )}

                    <Button 
                      onClick={verifyCode}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 font-semibold" 
                      size="lg"
                      disabled={isVerifying || otp.join('').length !== 6}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </Button>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground dark:text-white/50">
                        {"Didn't receive the code?"}
                      </p>
                      <button
                        onClick={sendVerificationCode}
                        disabled={countdown > 0 || isSending}
                        className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                      </button>
                    </div>

                    <button
                      onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); playSound('click') }}
                      className="flex items-center justify-center gap-2 w-full text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to signup
                    </button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <p className="text-foreground dark:text-white font-medium">Redirecting to complete your profile...</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Additional Info */}
            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    {verificationMethod === 'email' ? 'Email' : 'Phone'} verified successfully!
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-foreground/80 dark:text-white/80">Your Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/40" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="Mumbai, Maharashtra"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="pl-10 bg-white/50 dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-foreground/80 dark:text-white/80">Age</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/40" />
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="pl-10 bg-white/50 dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80 dark:text-white/80 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Health Conditions
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {healthOptions.map((condition) => (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => toggleHealthCondition(condition)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.healthConditions.includes(condition)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 dark:bg-white/5 text-foreground dark:text-white/70 hover:bg-white/20 dark:hover:bg-white/10'
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 font-semibold" 
                  size="lg"
                >
                  Create Account
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground dark:text-white/50">
              Already have an account?{' '}
              <Link href="/signin" className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
