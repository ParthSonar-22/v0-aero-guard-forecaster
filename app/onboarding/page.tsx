'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { User, Heart, Users, Activity, Wind, Baby, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedBackground } from '@/components/animated-background'

type Persona = 'child' | 'adult' | 'elderly' | 'athlete'
type HealthCondition = 'asthma' | 'respiratory' | 'cardiovascular' | 'diabetes' | 'none'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [persona, setPersona] = useState<Persona>('adult')
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>([])

  const handleHealthToggle = (condition: HealthCondition) => {
    if (condition === 'none') {
      setHealthConditions(['none'])
    } else {
      const filtered = healthConditions.filter(c => c !== 'none')
      if (healthConditions.includes(condition)) {
        setHealthConditions(filtered.filter(c => c !== condition))
      } else {
        setHealthConditions([...filtered, condition])
      }
    }
  }

  const handleComplete = () => {
    const userData = {
      persona,
      healthConditions,
    }
    localStorage.setItem('userProfile', JSON.stringify(userData))
    localStorage.setItem('needsOnboarding', 'false')
    router.push('/dashboard')
  }

  const personas = [
    {
      id: 'child' as Persona,
      icon: Baby,
      title: 'Child (0-12 years)',
      description: 'Developing lungs, more vulnerable to pollution',
    },
    {
      id: 'adult' as Persona,
      icon: User,
      title: 'Adult (13-59 years)',
      description: 'Standard air quality monitoring',
    },
    {
      id: 'elderly' as Persona,
      icon: Users,
      title: 'Elderly (60+ years)',
      description: 'Senior citizens with higher sensitivity',
    },
    {
      id: 'athlete' as Persona,
      icon: Activity,
      title: 'Athlete / Active',
      description: 'High outdoor activity and exercise routine',
    },
  ]

  const healthOptions = [
    { id: 'asthma' as HealthCondition, label: 'Asthma', icon: Wind, description: 'Breathing difficulties and wheezing' },
    { id: 'respiratory' as HealthCondition, label: 'Respiratory Issues', icon: Heart, description: 'COPD, bronchitis, or lung conditions' },
    { id: 'cardiovascular' as HealthCondition, label: 'Heart Disease', icon: Heart, description: 'Cardiovascular conditions' },
    { id: 'diabetes' as HealthCondition, label: 'Diabetes', icon: UserCircle, description: 'Type 1 or Type 2 diabetes' },
    { id: 'none' as HealthCondition, label: 'No Health Conditions', icon: User, description: 'I am healthy' },
  ]

  return (
    <div className="min-h-screen cosmic-bg relative">
      <AnimatedBackground />
      <Navbar />
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl glass border-white/10 shadow-2xl">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center gap-2">
                <div className={cn("h-2 w-20 rounded-full transition-colors", step >= 1 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-white/10")} />
                <div className={cn("h-2 w-20 rounded-full transition-colors", step >= 2 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-white/10")} />
              </div>
              <CardTitle className="text-3xl font-bold text-balance">
                {step === 1 ? 'Tell us about yourself' : 'Any health conditions?'}
              </CardTitle>
              <CardDescription className="text-pretty text-base">
                {step === 1 
                  ? 'Help us personalize your air quality recommendations based on your age group'
                  : 'Select any health conditions we should consider for safety recommendations'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {step === 1 && (
                <div className="space-y-3">
                  {personas.map((p) => {
                    const Icon = p.icon
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPersona(p.id)}
                        className={cn(
                          "w-full flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left hover:scale-[1.02]",
                          persona === p.id
                            ? "border-primary bg-primary/10 shadow-lg"
                            : "border-border/50 hover:border-primary/50 glass"
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-xl",
                          persona === p.id ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Icon className={cn(
                            "h-7 w-7",
                            persona === p.id ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground mb-1 text-lg">{p.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                        </div>
                      </button>
                    )
                  })}
                  <Button onClick={() => setStep(2)} className="w-full mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0" size="lg">
                    Continue to Health Information
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {healthOptions.map((option) => {
                    const Icon = option.icon
                    const isChecked = healthConditions.includes(option.id)
                    return (
                      <div
                        key={option.id}
                        onClick={() => handleHealthToggle(option.id)}
                        className={cn(
                          "flex items-start gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.02]",
                          isChecked
                            ? "border-primary bg-primary/10 shadow-lg"
                            : "border-border/50 hover:border-primary/50 glass"
                        )}
                      >
                        <Checkbox
                          id={option.id}
                          checked={isChecked}
                          onCheckedChange={() => handleHealthToggle(option.id)}
                          className="mt-1"
                        />
                        <div className={cn(
                          "p-3 rounded-xl",
                          isChecked ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Icon className={cn(
                            "h-6 w-6",
                            isChecked ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={option.id} className="cursor-pointer font-bold text-foreground text-base">
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex gap-4 mt-8">
                    <Button onClick={() => setStep(1)} variant="outline" className="flex-1 glass border-white/20 text-white hover:bg-white/10 bg-transparent" size="lg">
                      Back
                    </Button>
                    <Button 
                      onClick={handleComplete} 
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0" 
                      size="lg"
                      disabled={healthConditions.length === 0}
                    >
                      Complete Setup
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
