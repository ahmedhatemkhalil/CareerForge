import { LayoutDashboard, FileText, BarChart3, Mic, Map, User, ShieldCheck } from 'lucide-react'



export const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      name: 'My CV',
      path: '/cv',
      icon: FileText,
    },
    { name: 'CV Analysis', path: '/analyze', icon: BarChart3 },
    { name: 'Mock Interview', path: '/interview', icon: Mic },
    { name: 'Career Roadmaps', path: '/roadmap', icon: Map },
    { name: 'Profile & Settings', path: '/profile', icon: User },
    {
      name: 'Admin Panel',
      path: '/admin',
      icon: ShieldCheck,
      // adminOnly: true,
    },
  ]