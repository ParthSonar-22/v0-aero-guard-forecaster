import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, Info, Wind, Heart, Activity } from 'lucide-react'

interface UserProfile {
  persona: string
  healthConditions: string[]
}

interface SafetySuggestionProps {
  userProfile: UserProfile
  currentAQI: number
}

export function SafetySuggestion({ userProfile, currentAQI }: SafetySuggestionProps) {
  const getSuggestion = () => {
    const { persona, healthConditions } = userProfile
    const hasHealthIssues = healthConditions.some(c => c === 'asthma' || c === 'respiratory')
    
    // Athlete/Outdoor Worker Logic
    if (persona === 'athlete') {
      if (currentAQI > 150) {
        return {
          icon: AlertTriangle,
          variant: 'destructive' as const,
          title: 'Hazardous for Training',
          description: 'Air quality is unhealthy for outdoor activities. Shift training to indoors or postpone high-intensity workouts.',
          tips: [
            'Use indoor training facilities',
            'Reduce workout intensity',
            'Consider rescheduling to early morning',
          ],
        }
      }
      if (currentAQI > 100) {
        return {
          icon: Info,
          variant: 'default' as const,
          title: 'Moderate Risk for Athletes',
          description: 'Sensitive individuals may experience respiratory discomfort. Reduce prolonged outdoor exertion.',
          tips: [
            'Monitor breathing during workouts',
            'Take more frequent breaks',
            'Stay hydrated',
          ],
        }
      }
      return {
        icon: CheckCircle,
        variant: 'default' as const,
        title: 'Good for Training',
        description: 'Air quality is favorable for outdoor activities and high-intensity training.',
        tips: [
          'Optimal conditions for outdoor training',
          'Stay hydrated throughout',
          'Peak performance window',
        ],
      }
    }
    
    // Child/Elderly Logic
    if (persona === 'child-elderly') {
      if (currentAQI > 100) {
        return {
          icon: AlertTriangle,
          variant: 'destructive' as const,
          title: 'Stay Indoors Recommended',
          description: 'Air quality poses health risks for vulnerable groups. Limit outdoor exposure.',
          tips: [
            'Keep windows closed',
            'Use air purifiers indoors',
            'Avoid outdoor activities',
          ],
        }
      }
      if (currentAQI > 50) {
        return {
          icon: Info,
          variant: 'default' as const,
          title: 'Moderate Caution',
          description: 'Sensitive groups should limit prolonged outdoor activities.',
          tips: [
            'Limit outdoor time',
            'Watch for symptoms',
            'Take breaks indoors',
          ],
        }
      }
      return {
        icon: CheckCircle,
        variant: 'default' as const,
        title: 'Safe for Outdoor Activities',
        description: 'Air quality is good. Safe for outdoor play and activities.',
        tips: [
          'Great time for outdoor activities',
          'Enjoy fresh air safely',
          'Regular hydration recommended',
        ],
      }
    }
    
    // General Public Logic
    if (hasHealthIssues) {
      if (currentAQI > 100) {
        return {
          icon: AlertTriangle,
          variant: 'destructive' as const,
          title: 'High Risk Alert',
          description: 'Air quality may trigger respiratory symptoms. Take precautions.',
          tips: [
            'Carry rescue inhaler if prescribed',
            'Limit outdoor exposure',
            'Monitor symptoms closely',
          ],
        }
      }
    }
    
    if (currentAQI > 150) {
      return {
        icon: AlertTriangle,
        variant: 'destructive' as const,
        title: 'Unhealthy Air Quality',
        description: 'Everyone may experience health effects. Avoid prolonged outdoor exposure.',
        tips: [
          'Stay indoors when possible',
          'Use air purifiers',
          'Wear N95 mask if going out',
        ],
      }
    }
    
    if (currentAQI > 100) {
      return {
        icon: Info,
        variant: 'default' as const,
        title: 'Moderate Air Quality',
        description: 'Sensitive groups should consider limiting outdoor activities.',
        tips: [
          'Monitor air quality updates',
          'Limit strenuous activities',
          'Stay hydrated',
        ],
      }
    }
    
    return {
      icon: CheckCircle,
      variant: 'default' as const,
      title: 'Safe for Outdoor Activities',
      description: 'Air quality is satisfactory. Enjoy your outdoor activities.',
      tips: [
        'Good time for outdoor activities',
        'Maintain regular routines',
        'Stay informed of changes',
      ],
    }
  }

  const suggestion = getSuggestion()
  const Icon = suggestion.icon

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Safety Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant={suggestion.variant} className="mb-4">
          <Icon className="h-4 w-4" />
          <AlertTitle>{suggestion.title}</AlertTitle>
          <AlertDescription className="mt-2 text-sm leading-relaxed">
            {suggestion.description}
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground mb-3">Personalized Tips:</h4>
          {suggestion.tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="text-muted-foreground leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>

        {userProfile.healthConditions.some(c => c === 'asthma' || c === 'respiratory') && (
          <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Based on your respiratory health profile, we recommend extra caution during moderate to poor air quality conditions.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
