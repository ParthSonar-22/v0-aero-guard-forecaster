import { NextResponse } from 'next/server'

// In-memory store for verification codes (in production, use Redis or a database)
const verificationCodes = new Map<string, { code: string; expiresAt: number; type: 'email' | 'phone' }>()

// Generate a 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, email, phone, code } = body

    if (action === 'send') {
      // Generate verification code
      const verificationCode = generateCode()
      const identifier = email || phone
      const type = email ? 'email' : 'phone'
      
      // Store code with 10-minute expiration
      verificationCodes.set(identifier, {
        code: verificationCode,
        expiresAt: Date.now() + 10 * 60 * 1000,
        type
      })

      // In production, you would send this via email/SMS service
      // For demo, we'll return the code in the response (remove in production!)
      console.log(`[AeroGuard] Verification code for ${identifier}: ${verificationCode}`)

      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 500))

      return NextResponse.json({ 
        success: true, 
        message: `Verification code sent to ${type === 'email' ? 'your email' : 'your phone'}`,
        // DEMO ONLY - Remove in production!
        demoCode: verificationCode
      })
    }

    if (action === 'verify') {
      const identifier = email || phone
      const stored = verificationCodes.get(identifier)

      if (!stored) {
        return NextResponse.json({ 
          success: false, 
          message: 'No verification code found. Please request a new one.' 
        }, { status: 400 })
      }

      if (Date.now() > stored.expiresAt) {
        verificationCodes.delete(identifier)
        return NextResponse.json({ 
          success: false, 
          message: 'Verification code has expired. Please request a new one.' 
        }, { status: 400 })
      }

      if (stored.code !== code) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid verification code. Please try again.' 
        }, { status: 400 })
      }

      // Code is valid - delete it
      verificationCodes.delete(identifier)

      return NextResponse.json({ 
        success: true, 
        message: 'Verification successful!',
        verified: true
      })
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action' 
    }, { status: 400 })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred' 
    }, { status: 500 })
  }
}
