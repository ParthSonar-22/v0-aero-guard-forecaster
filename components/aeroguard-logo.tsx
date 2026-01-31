import { Shield } from 'lucide-react'

export function AeroGuardLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Shield className="h-8 w-8 text-primary fill-primary/20" strokeWidth={2} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xl font-bold tracking-tight text-foreground">AeroGuard</span>
        <span className="text-[10px] font-medium text-muted-foreground tracking-wide">HYPER-LOCAL AIR QUALITY</span>
      </div>
    </div>
  )
}
