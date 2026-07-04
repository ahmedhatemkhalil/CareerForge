import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Mic,
  Map,
  User,
  ShieldCheck,
  CreditCard,
  Mail,
} from 'lucide-react'

export const isNavItemActive = (pathname, item) => {
  if (pathname === item.path) return true
  if (pathname.startsWith(`${item.path}/`)) return true
  if (
    item.relatedPaths?.some(
      (related) =>
        pathname === related || pathname.startsWith(`${related}/`),
    )
  ) {
    return true
  }
  return false
}

export const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    name: 'My CV',
    path: '/cv',
    icon: FileText,
    badge: 'Active',
  },
  {
    name: 'CV Analysis',
    path: '/analyze',
    icon: BarChart3,
    relatedPaths: ['/new-analysis'],
  },
  {
    name: 'Mock Interview',
    path: '/interview',
    icon: Mic,
    relatedPaths: ['/new-interview', '/live-interview'],
  },
  {
    name: 'Career Roadmaps',
    path: '/roadmap',
    icon: Map,
    relatedPaths: ['/new-roadmap'],
  },
  {
    name: 'Pricing & Plans',
    path: '/pricing',
    icon: CreditCard,
    userOnly: true,
  },
  { name: 'Email', path: '/email', icon: Mail },
  
  { name: 'Profile & Settings', path: '/profile', icon: User },
  {
    name: 'Admin Panel',
    path: '/admin',
    icon: ShieldCheck,
    adminOnly: true,
  },
]
