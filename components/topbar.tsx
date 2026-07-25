'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  LogOut,
  Settings,
  UserCog,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sidebar } from '@/components/sidebar'
import { useAuth } from '@/components/auth-provider'
import { notifications } from '@/lib/data'

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const { user, setRole } = useAuth()
  const [mounted, setMounted] = useState(false)
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border glass px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Open navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search vehicles, parts, records..."
          className="h-9 pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Badge
          variant="outline"
          className="hidden gap-1.5 border-success/40 text-success sm:flex"
        >
          <span className="size-1.5 rounded-full bg-success" />
          Live
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {mounted && theme === 'dark' ? (
            <Sun className="size-5" />
          ) : (
            <Moon className="size-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Button asChild variant="ghost" size="icon" className="relative">
          <a href="/notifications" aria-label="Notifications">
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </a>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 pl-1.5 pr-2">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-xs font-medium">{user.name}</p>
                <p className="text-[10px] text-muted-foreground">{user.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserCog className="size-3.5" /> Preview role
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={user.role}
              onValueChange={(v) => setRole(v as 'Admin' | 'Viewer')}
            >
              <DropdownMenuRadioItem value="Admin">Admin</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Viewer">
                Viewer
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="size-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
