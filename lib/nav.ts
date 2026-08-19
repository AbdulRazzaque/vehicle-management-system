import {
  LayoutDashboard,
  Truck,
  Wrench,
  Hammer,
  Boxes,
  Receipt,
  BarChart3,
  Bell,
  Users,
  FileText,
  ScrollText,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  group: string
  adminOnly?: boolean
}

export const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard, group: 'Overview' },
  { title: 'Vehicles', href: '/vehicles', icon: Truck, group: 'Fleet' },
  { title: 'Maintenance', href: '/maintenance', icon: Wrench, group: 'Fleet' },
  { title: 'Repairs', href: '/repairs', icon: Hammer, group: 'Fleet' },
  { title: 'Inventory', href: '/inventory', icon: Boxes, group: 'Operations' },
  { title: 'Expenses', href: '/expenses', icon: Receipt, group: 'Operations' },
  { title: 'Reports', href: '/reports', icon: BarChart3, group: 'Operations' },
  { title: 'Notifications', href: '/notifications', icon: Bell, group: 'System' },
  { title: 'Users', href: '/users', icon: Users, group: 'System', adminOnly: true },
  { title: 'Documents', href: '/documents', icon: FileText, group: 'System' },
  { title: 'Audit Logs', href: '/audit', icon: ScrollText, group: 'System', adminOnly: true },
]

export const navGroups = ['Overview', 'Fleet', 'Operations', 'System']
