'use client'

import type React from "react"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Mail, Lock } from 'lucide-react'
import { AnimatedBackground } from '@/components/animated-background'

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const existingUser = localStorage.getItem('user')
    if (existingUser) {
      const needsOnboarding = localStorage.getItem('needsOnboarding')
      if (needsOnboarding === 'true') {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    } else {
      localStorage.setItem('user', JSON.stringify({ name: 'Demo User', email: formData.email }))
      localStorage.setItem('needsOnboarding', 'true')
      router.push('/onboarding')
    }
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
              <CardTitle className="text-2xl font-bold text-foreground dark:text-white">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground dark:text-white/60 mt-2">
                Sign in to access your air quality dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Enter your password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 bg-white/50 dark:bg-white/5 border-emerald-500/20 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus:border-emerald-500/50"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 font-semibold" size="lg">
                Sign In
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground dark:text-white/50">
              {"Don't have an account? "}
              <Link href="/signup" className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
