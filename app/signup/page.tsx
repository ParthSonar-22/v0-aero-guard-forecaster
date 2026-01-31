'use client'

import type React from "react"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { AnimatedBackground } from '@/components/animated-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Mail, Lock, User, Phone, MapPin, Calendar, Heart } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
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

  const toggleHealthCondition = (condition: string) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 2) {
      setStep(2)
      return
    }
    localStorage.setItem('user', JSON.stringify({ 
      name: formData.name, 
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      age: formData.age,
      healthConditions: formData.healthConditions
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
            <div className="mx-auto p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 w-fit border border-emerald-500/30 animate-pulse-glow">
              <Shield className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground dark:text-white">Join AeroGuard</CardTitle>
              <CardDescription className="text-muted-foreground dark:text-white/60 mt-2">
                {step === 1 ? 'Create your account' : 'Tell us more about you'}
              </CardDescription>
            </div>
            {/* Progress indicator */}
            <div className="flex justify-center gap-2">
              <div className={`h-2 w-16 rounded-full transition-all ${step >= 1 ? 'bg-emerald-500' : 'bg-white/20'}`} />
              <div className={`h-2 w-16 rounded-full transition-all ${step >= 2 ? 'bg-emerald-500' : 'bg-white/20'}`} />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
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
                    <Label htmlFor="password" className="text-foreground/80 dark:text-white/80">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white/40" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 bg-white/50 dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground/80 dark:text-white/80">Phone Number</Label>
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
                </>
              )}
              
              <div className="flex gap-3">
                {step > 1 && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-emerald-500/30 text-foreground dark:text-white hover:bg-emerald-500/10"
                  >
                    Back
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 font-semibold" 
                  size="lg"
                >
                  {step === 1 ? 'Continue' : 'Create Account'}
                </Button>
              </div>
            </form>
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
