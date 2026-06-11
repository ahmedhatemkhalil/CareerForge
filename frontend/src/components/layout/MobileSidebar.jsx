import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Sidebar from './Sidebar/Sidebar.jsx'

export default function MobileSidebar({ children }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3 lg:hidden">
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <span className="text-base font-semibold">CareerForge</span>
        </header>

        {children}
      </div>

      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-64 border-sidebar-border bg-sidebar p-0 sm:max-w-xs"
      >
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}
