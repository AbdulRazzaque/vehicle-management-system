'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, User, Gauge, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateUsername = (val: string) => {
    if (!val.trim()) {
      setUsernameError('Username is required')
      return false
    }
    setUsernameError('')
    return true
  }

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required')
      return false
    }
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleUsernameChange = (val: string) => {
    setUsername(val)
    if (usernameError) {
      setUsernameError('')
    }
  }

  const handlePasswordChange = (val: string) => {
    setPassword(val)
    if (passwordError) {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isUsernameValid = validateUsername(username)
    const isPasswordValid = validatePassword(password)

    if (!isUsernameValid || !isPasswordValid) {
      return
    }

    setIsSubmitting(true)
    try {
      const success = await login(username.trim(), password, rememberMe)
      if (success) {
        toast.success('Successfully logged in')
      } else {
        toast.error('Invalid credentials. Check your username or password.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background">
      {/* Left side brand experience */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between bg-zinc-950 p-12 text-white overflow-hidden select-none">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-primary),transparent_50%)] opacity-20 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 size-[30rem] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        {/* Logo and title */}
        <div className="flex items-center gap-3 z-10">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Gauge className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Tharb</span>
        </div>

        {/* Mock Telemetry Widget */}
        <div className="my-auto max-w-md space-y-8 z-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Vehicle Management System
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed">
              Track, analyze, and optimize every vehicle, maintenance record, and expense in real-time with our enterprise-grade management platform.
            </p>
          </div>

          {/* Miniature telemetry dashboard mockup */}

        </div>

        {/* Footer info */}

      </div>

      {/* Right side form */}
      <div className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2 bg-background relative overflow-hidden">
        {/* Glow decoration for mobile background */}
        <div className="absolute -top-1/4 -right-1/4 size-[24rem] rounded-full bg-primary/10 blur-3xl opacity-50 lg:hidden pointer-events-none" />
        <div className="absolute -bottom-1/4 -left-1/4 size-[24rem] rounded-full bg-primary/5 blur-3xl opacity-50 lg:hidden pointer-events-none" />

        <div className="w-full max-w-[400px] space-y-8 z-10">
          {/* Header on mobile */}
          <div className="flex flex-col items-center text-center lg:hidden">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Gauge className="size-6 animate-pulse" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Tharb</h1>
            <p className="mt-1 text-sm text-muted-foreground">Fleet & Maintenance Management System</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to manage your fleet
              </p>
            </div>

            <Card className="border border-border/40 shadow-xl backdrop-blur-sm bg-card/60 rounded-2xl">
              <form onSubmit={handleSubmit} noValidate>
                <CardContent className="space-y-4 pt-6">
                  {/* Username field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        onBlur={() => validateUsername(username)}
                        className={`pl-9 bg-background/50 border transition-all duration-200 focus-visible:ring-2 ${usernameError
                          ? 'border-destructive focus-visible:ring-destructive/30'
                          : 'border-border/60 focus-visible:ring-primary/30'
                          }`}
                        disabled={isSubmitting}
                        autoComplete="username"
                      />
                    </div>
                    {/* Prevent Layout Shift Error Slot */}
                    <div className="h-5 overflow-hidden">
                      {usernameError && (
                        <p className="text-[11px] text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                          <AlertCircle className="size-3" />
                          {usernameError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Password
                      </Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        onBlur={() => validatePassword(password)}
                        className={`pl-9 pr-10 bg-background/50 border transition-all duration-200 focus-visible:ring-2 ${passwordError
                          ? 'border-destructive focus-visible:ring-destructive/30'
                          : 'border-border/60 focus-visible:ring-primary/30'
                          }`}
                        disabled={isSubmitting}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors animate-fade-in"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {/* Prevent Layout Shift Error Slot */}
                    <div className="h-5 overflow-hidden">
                      {passwordError && (
                        <p className="text-[11px] text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                          <AlertCircle className="size-3" />
                          {passwordError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isSubmitting}
                        className="size-4 rounded border-input bg-background/50 text-primary focus:ring-ring focus:ring-offset-background accent-primary cursor-pointer transition-colors"
                      />
                      <label
                        htmlFor="remember-me"
                        className="text-xs font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-zinc-600 dark:text-zinc-400"
                      >
                        Remember me for 30 days
                      </label>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-6 pb-6 mt-4">
                  <Button
                    type="submit"
                    className="w-full py-5 font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent " />
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>


                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
