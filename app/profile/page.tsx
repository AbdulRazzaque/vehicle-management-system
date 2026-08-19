'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { User, Mail, Shield, KeyRound, AlertCircle, CheckCircle2, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (!currentPassword) {
      setPasswordError('Current password is required')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match')
      return
    }

    setIsSubmitting(true)
    try {
      // Mocking API call to update password
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      toast.success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Failed to update password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Profile"
        description="View your account details and manage security settings."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Side: Profile Summary */}
        <div className="space-y-6 col-span-1">
          <Card className="overflow-hidden border border-border/40 shadow-md">
            <div className="h-20 bg-gradient-to-r from-primary/30 to-primary" />
            <CardContent className="relative pt-12 pb-6 text-center">
              {/* Initials Avatar */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <Avatar className="size-24 border-4 border-card ring-1 ring-border shadow-xl">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-1 mt-2">
                <h2 className="text-xl font-bold tracking-tight">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              <div className="mt-4 flex flex-col items-center gap-2">
                <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'} className="px-3 py-0.5">
                  <Shield className="size-3 mr-1" />
                  {user.role}
                </Badge>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Session Active</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t border-border/30 bg-muted/30 py-4 flex justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={logout}
                className="w-full gap-2 font-medium"
              >
                <LogOut className="size-4" />
                Sign out of account
              </Button>
            </CardFooter>
          </Card>

          {/* Account information / organization note */}
          <Card className="border border-border/30 bg-muted/20 p-4">
            <CardContent className="space-y-2 p-0 text-xs text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground">Organization Managed Profile</p>
              <p>
                Your personal details (Name, Email, and Access Role) are managed by the Fleet Administration.
              </p>
              <p>
                To request modifications to your display name or update your permissions, please contact your administrator.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Account & Security settings */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-border/40 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Account Profile</CardTitle>
              <CardDescription>General account parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="displayName" className="text-xs font-semibold text-muted-foreground">
                    Full name
                  </Label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      id="displayName"
                      value={user.name}
                      disabled
                      className="pl-9 bg-muted/30 border-border/40 text-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="displayEmail" className="text-xs font-semibold text-muted-foreground">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      id="displayEmail"
                      value={user.email}
                      disabled
                      className="pl-9 bg-muted/30 border-border/40 text-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border border-border/40 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Security Settings</CardTitle>
              <CardDescription>Update your login credentials to secure your account.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                {/* Validation Error Banner */}
                {passwordError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPass" className="text-xs font-semibold">
                      Current Password
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="currentPass"
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pl-9 focus-visible:ring-primary/30"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* New Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="newPass" className="text-xs font-semibold">
                        New Password
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="newPass"
                          type="password"
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-9 focus-visible:ring-primary/30"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPass" className="text-xs font-semibold">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="confirmPass"
                          type="password"
                          placeholder="Re-type new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-9 focus-visible:ring-primary/30"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/30 bg-muted/10 py-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-6 font-semibold"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Updating password...
                    </span>
                  ) : (
                    'Save password'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
