'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  Shield, 
  Activity, 
  Brain, 
  MapPin, 
  Users, 
  TrendingUp,
  Wind,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { AnimatedBackground } from '@/components/animated-background'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Predictions',
    description: 'Our temporal prediction engine forecasts AQI for the next 6-12 hours using ML models trained on historical patterns.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: MapPin,
    title: 'Hyper-Local Monitoring',
    description: 'Street-level air quality data that captures variations between parks, traffic junctions, and industrial zones.',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: Users,
    title: 'Personalized Health Risk',
    description: 'Tailored recommendations for children, elderly, athletes, and those with respiratory conditions.',
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    icon: Activity,
    title: 'Real-Time Explainability',
    description: 'Understand WHY pollution levels are high with human-readable explanations of contributing factors.',
    gradient: 'from-purple-500 to-pink-500'
  }
]

const stats = [
  { value: '95%', label: 'Prediction Accuracy' },
  { value: '6-12h', label: 'Forecast Window' },
  { value: '50m', label: 'Spatial Resolution' },
  { value: '24/7', label: 'Real-time Updates' }
]

const healthImpacts = [
  {
    icon: AlertTriangle,
    title: 'Why Pollution Monitoring Matters',
    points: [
      'Air pollution causes 7 million premature deaths annually worldwide',
      'PM2.5 particles penetrate deep into lungs, entering the bloodstream',
      'Children and elderly face 2-3x higher health risks from poor air quality',
      'Short-term exposure can trigger asthma attacks and heart problems'
    ]
  },
  {
    icon: CheckCircle2,
    title: 'How AeroGuard Protects You',
    points: [
      'Get alerts before pollution levels spike in your exact location',
      'Plan outdoor activities during optimal air quality windows',
      'Receive personalized health advice based on your profile',
      'Track historical trends to understand your exposure'
    ]
  }
]

export default function Home() {
  const router = useRouter()
  const [currentAQI, setCurrentAQI] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Animate AQI counter
    const interval = setInterval(() => {
      setCurrentAQI(prev => {
        if (prev < 156) return prev + 3
        return 156
      })
    }, 30)

    const user = localStorage.getItem('user')
    setIsAuthenticated(!!user)

    return () => clearInterval(interval)
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/signup')
    }
  }

  return (
    <div className="min-h-screen cosmic-bg text-foreground dark:text-white relative">
      <AnimatedBackground />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/images/pngtree-eco-life-nature-simple-icon-logo-png-image-7114913.png" 
              alt="AeroGuard Logo" 
              className="w-10 h-10 animate-pulse-glow rounded-full"
            />
            <span className="text-xl font-bold gradient-text">AeroGuard</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/80 hover:text-white transition">Features</a>
            <a href="#why-monitor" className="text-sm text-white/80 hover:text-white transition">Why Monitor</a>
            <a href="#solution" className="text-sm text-white/80 hover:text-white transition">Solution</a>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hidden sm:flex dark:bg-emerald-500/20 dark:text-emerald-400">
              <MapPin className="w-3 h-3 mr-1" />
              Mumbai, India
            </Badge>
            <ThemeToggle />
            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
            >
              {isAuthenticated ? 'Dashboard' : 'Launch App'}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-4">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-emerald-500/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            HYPERLOCAL AIR QUALITY INTELLIGENCE
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-foreground dark:text-white">Breathe Smarter with</span>
            <br />
            <span className="gradient-text">Real-Time Forecasts</span>
          </h1>
          
          <p className="text-xl text-muted-foreground dark:text-white/70 max-w-3xl mx-auto mb-8 leading-relaxed">
            AeroGuard provides street-level air quality data and personalized health risk 
            assessments to help you plan your day with confidence. Know before you go.
          </p>

          {/* Live AQI Display */}
          <div className="inline-flex items-center gap-6 glass rounded-2xl px-8 py-6 mb-10 border-amber-500/30">
            <div className="text-left">
              <p className="text-sm text-muted-foreground dark:text-white/60 mb-1">Current Mumbai AQI</p>
              <p className="text-5xl font-bold text-amber-500 dark:text-amber-400">{currentAQI}</p>
            </div>
            <div className="w-px h-16 bg-amber-500/30 dark:bg-white/20" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground dark:text-white/60 mb-1">Air Quality Status</p>
              <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                Unhealthy for Sensitive Groups
              </Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg px-8 py-6 rounded-full border-0 shadow-lg shadow-emerald-500/25"
            >
              Try Live Forecast
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4 border-emerald-500/20 dark:border-emerald-500/30">
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground dark:text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              ADVANCED FEATURES
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground dark:text-white">Why Choose </span>
              <span className="gradient-text">AeroGuard?</span>
            </h2>
            <p className="text-lg text-muted-foreground dark:text-white/60 max-w-2xl mx-auto">
              Advanced sensor networks combined with AI prediction models give you the most accurate data available.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <Card key={i} className="glass border-emerald-500/20 dark:border-emerald-500/30 p-8 card-hover group">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground dark:text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground dark:text-white/60 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Monitor Section */}
      <section id="why-monitor" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Heart className="w-4 h-4 mr-2" />
              HEALTH IMPACT
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground dark:text-white">
              Why You Need to Monitor Air Quality
            </h2>
            <p className="text-lg text-muted-foreground dark:text-white/60 max-w-2xl mx-auto">
              Air pollution does not impact all individuals equally. Protect yourself with knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {healthImpacts.map((section, i) => (
              <Card key={i} className={`glass p-8 ${i === 0 ? 'border-red-500/20 dark:border-red-500/30' : 'border-emerald-500/20 dark:border-emerald-500/30'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl ${i === 0 ? 'bg-gradient-to-br from-red-500/30 to-orange-500/30' : 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30'} flex items-center justify-center`}>
                    <section.icon className={`w-6 h-6 ${i === 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground dark:text-white">{section.title}</h3>
                </div>
                <ul className="space-y-4">
                  {section.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-3 text-muted-foreground dark:text-white/70">
                      <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${i === 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
              <TrendingUp className="w-4 h-4 mr-2" />
              THE SOLUTION
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground dark:text-white">
              End-to-End AI System
            </h2>
            <p className="text-lg text-muted-foreground dark:text-white/60 max-w-3xl mx-auto">
              Our intelligent system forecasts near-term air quality at a hyper-local level and translates 
              these forecasts into personalized, scientifically grounded health risk alerts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="glass border-emerald-500/20 dark:border-emerald-500/30 p-6 text-center card-hover">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-bold text-foreground dark:text-white mb-2">Temporal Prediction</h3>
              <p className="text-muted-foreground dark:text-white/60 text-sm">
                ML models analyze 24-hour historical data to forecast AQI/PM2.5 for 6-12 hours ahead.
              </p>
            </Card>
            
            <Card className="glass border-cyan-500/20 dark:border-cyan-500/30 p-6 text-center card-hover">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-bold text-foreground dark:text-white mb-2">Risk Classification</h3>
              <p className="text-muted-foreground dark:text-white/60 text-sm">
                Converts AQI into personalized risk levels aligned with WHO/EPA standards.
              </p>
            </Card>
            
            <Card className="glass border-amber-500/20 dark:border-amber-500/30 p-6 text-center card-hover">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-bold text-foreground dark:text-white mb-2">Clear Explainability</h3>
              <p className="text-muted-foreground dark:text-white/60 text-sm">
                Human-readable explanations of why AQI is high and which factors contribute most.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <Card className="glass border-emerald-500/30 p-12 text-center max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/15" />
            <div className="relative z-10">
              <img 
                src="/images/pngtree-eco-life-nature-simple-icon-logo-png-image-7114913.png" 
                alt="AeroGuard Logo" 
                className="w-20 h-20 mx-auto mb-6 animate-pulse-glow rounded-full"
              />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground dark:text-white">
                Start Breathing Smarter Today
              </h2>
              <p className="text-lg text-muted-foreground dark:text-white/60 max-w-xl mx-auto mb-8">
                Join thousands of users who rely on AeroGuard for personalized air quality intelligence.
              </p>
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg px-10 py-6 rounded-full border-0 shadow-lg shadow-emerald-500/25"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-emerald-500/20 dark:border-white/10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/images/pngtree-eco-life-nature-simple-icon-logo-png-image-7114913.png" 
              alt="AeroGuard Logo" 
              className="w-8 h-8"
            />
            <span className="font-semibold text-foreground dark:text-white">AeroGuard</span>
          </div>
          <p className="text-sm text-muted-foreground dark:text-white/50">
            Hyper-Local Air Quality & Health Risk Forecaster - Hack-AI-Thon 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
