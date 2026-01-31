'use client'

import React from "react"
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  Wind,
  Heart,
  AlertCircle,
  BarChart3,
  Bell,
  Settings,
  Home
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const quickQuestions = [
  { icon: Wind, text: 'Is it safe to go outside today?' },
  { icon: Heart, text: 'How does PM2.5 affect my health?' },
  { icon: AlertCircle, text: 'Tips for asthma patients' },
  { icon: Home, text: 'Navigate to dashboard' },
  { icon: BarChart3, text: 'Show me analytics' },
  { icon: Bell, text: 'Check my alerts' },
]

// Smart response system
const getSmartResponse = (input: string, navigate: (path: string) => void): { response: string; action?: () => void } => {
  const lowerInput = input.toLowerCase()
  
  // Navigation commands
  if (lowerInput.includes('dashboard') || lowerInput.includes('home')) {
    return {
      response: "I'll take you to the dashboard right away! You can view your current AQI, health recommendations, and more there.",
      action: () => navigate('/dashboard')
    }
  }
  if (lowerInput.includes('analytics') || lowerInput.includes('trends') || lowerInput.includes('chart')) {
    return {
      response: "Opening the Analytics section for you! You'll find detailed air quality trends, pollution patterns, and historical data there.",
      action: () => navigate('/dashboard?tab=analytics')
    }
  }
  if (lowerInput.includes('alert') || lowerInput.includes('notification')) {
    return {
      response: "Let me show you your alerts! You can view all air quality warnings and customize your notification preferences there.",
      action: () => navigate('/dashboard?tab=alerts')
    }
  }
  if (lowerInput.includes('setting') || lowerInput.includes('preference')) {
    return {
      response: "Opening Settings for you! You can adjust themes, sounds, notifications, and your health profile there.",
      action: () => navigate('/dashboard?tab=settings')
    }
  }
  
  // Air quality questions
  if (lowerInput.includes('safe') && (lowerInput.includes('outside') || lowerInput.includes('outdoor'))) {
    return {
      response: "Based on current Mumbai AQI of 156 (Unhealthy for Sensitive Groups):\n\n- General public: Limit prolonged outdoor exertion\n- Sensitive groups (asthma, elderly, children): Avoid outdoor activities\n- Best time to go out: Early morning (5-7 AM) when AQI is typically lower\n\nWould you like me to show you the hourly forecast?"
    }
  }
  
  if (lowerInput.includes('pm2.5') || lowerInput.includes('pm 2.5') || lowerInput.includes('particulate')) {
    return {
      response: "PM2.5 (Fine Particulate Matter) Health Effects:\n\n- Size: 2.5 micrometers (30x smaller than hair)\n- Can penetrate deep into lungs and bloodstream\n- Short-term: Eye/throat irritation, coughing, shortness of breath\n- Long-term: Heart disease, lung cancer, reduced lung function\n\nCurrent Mumbai PM2.5: 78 µg/m³ (WHO limit: 15 µg/m³)\n\nI recommend checking the Analytics tab for detailed trends!"
    }
  }
  
  if (lowerInput.includes('asthma')) {
    return {
      response: "Tips for Asthma Patients During Poor Air Quality:\n\n1. Keep rescue inhaler accessible at all times\n2. Stay indoors when AQI > 100\n3. Use air purifiers with HEPA filters\n4. Keep windows closed during peak pollution\n5. Wear N95 mask if going outside is necessary\n6. Monitor symptoms closely - seek help if worsening\n\nWould you like me to set up personalized asthma alerts for you?"
    }
  }
  
  if (lowerInput.includes('mask') || lowerInput.includes('n95')) {
    return {
      response: "Mask Recommendations:\n\n- AQI 0-100: No mask needed\n- AQI 101-150: N95 recommended for sensitive groups\n- AQI 151-200: N95 recommended for everyone outdoors\n- AQI 200+: N95 essential, limit outdoor time\n\nTip: Ensure proper fit - no gaps around nose and chin!"
    }
  }
  
  if (lowerInput.includes('aqi') && (lowerInput.includes('what') || lowerInput.includes('mean'))) {
    return {
      response: "AQI (Air Quality Index) Scale:\n\n- 0-50: Good (Green) - Air quality is satisfactory\n- 51-100: Moderate (Yellow) - Acceptable for most\n- 101-150: Unhealthy for Sensitive Groups (Orange)\n- 151-200: Unhealthy (Red) - Everyone may experience effects\n- 201-300: Very Unhealthy (Purple) - Health warnings\n- 300+: Hazardous (Maroon) - Emergency conditions\n\nCurrent Mumbai: 156 - Unhealthy for Sensitive Groups"
    }
  }
  
  if (lowerInput.includes('children') || lowerInput.includes('kids') || lowerInput.includes('child')) {
    return {
      response: "Protecting Children from Air Pollution:\n\n- Children breathe faster, inhaling more pollutants per body weight\n- Developing lungs are more vulnerable\n- Keep indoor play on high AQI days\n- Schools should limit outdoor PE when AQI > 100\n- Consider air purifiers in children's bedrooms\n- Watch for symptoms: coughing, wheezing, fatigue"
    }
  }
  
  if (lowerInput.includes('purifier') || lowerInput.includes('filter') || lowerInput.includes('indoor')) {
    return {
      response: "Indoor Air Quality Tips:\n\n- Use HEPA air purifiers (removes 99.97% of particles)\n- Keep doors/windows closed during high AQI\n- Indoor plants help but can't replace purifiers\n- Avoid burning candles, incense, or cooking without ventilation\n- Regular HVAC filter changes (every 2-3 months)\n- Consider air quality monitors for each room"
    }
  }
  
  if (lowerInput.includes('exercise') || lowerInput.includes('workout') || lowerInput.includes('run') || lowerInput.includes('jog')) {
    return {
      response: "Exercise & Air Quality Guidelines:\n\n- AQI 0-50: Safe for all outdoor activities\n- AQI 51-100: Sensitive individuals should limit intense outdoor exercise\n- AQI 101-150: Reduce prolonged outdoor exertion\n- AQI 150+: Move workouts indoors\n\nBest times: Early morning or late evening when pollution is lower. Check our hourly forecast in Analytics!"
    }
  }
  
  if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
    return {
      response: "Hello! I'm your AeroGuard AI assistant. I can help you with:\n\n- Air quality information & health tips\n- Navigate to Dashboard, Analytics, Alerts, or Settings\n- Personalized recommendations for your health conditions\n- Understanding AQI and pollution effects\n\nWhat would you like to know?"
    }
  }
  
  if (lowerInput.includes('thank')) {
    return {
      response: "You're welcome! Stay safe and breathe easy. Feel free to ask me anything else about air quality or use the quick buttons below to navigate the app!"
    }
  }
  
  // Default response
  return {
    response: "I can help you with:\n\n- Air quality & health information\n- Navigation: Say 'dashboard', 'analytics', 'alerts', or 'settings'\n- Health tips for asthma, children, exercise, etc.\n- Understanding AQI, PM2.5, and pollution effects\n\nTry asking: 'Is it safe to go outside today?' or 'Tips for asthma patients'"
  }
}

const sendMessage = (message: { text: string }) => {
  // Implementation of sendMessage function
}

export function HealthChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const processMessage = (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Get smart response
    setTimeout(() => {
      const { response, action } = getSmartResponse(text, router.push)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      }
      setMessages(prev => [...prev, botMessage])
      setIsLoading(false)
      
      // Execute navigation action after a short delay
      if (action) {
        setTimeout(action, 1500)
      }
    }, 800)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    processMessage(input)
    setInput('')
  }

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return
    processMessage(question)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-110 ${isOpen ? 'hidden' : ''}`}
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-xs font-bold">
          AI
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] flex flex-col glass border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">AeroGuard AI</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white/80">Health Advisor</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Hi! I am AeroGuard AI</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Your personal air quality health advisor. Ask me anything about pollution and health!
                </p>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q.text)}
                      className="w-full flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition text-left text-sm"
                    >
                      <q.icon className="w-4 h-4 text-emerald-500" />
                      <span className="text-foreground">{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl p-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {isLoading && messages.length > 0 && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl p-3">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about air quality..."
                className="flex-1 px-4 py-3 rounded-full bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Powered by AeroGuard AI - Not a substitute for medical advice
            </p>
          </form>
        </Card>
      )}
    </>
  )
}
