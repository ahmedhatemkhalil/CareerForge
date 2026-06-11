import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, LogOut, Sparkles } from 'lucide-react'

import ConfirmModal from '@/components/common/ConfirmModal'
import { cn } from '@/lib/utils'
import { logoutUser } from '@/services/authService'
import useAuthStore from '@/stores/authStore'
import { getInitials } from '@/utils/helpers'
import { navItems } from './static'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const [collapsed, setCollapsed] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        await logoutUser(refreshToken)
      }

      toast.success('Logged out successfully')
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Logout failed on server, clearing local session',
      )
    } finally {
      logout()
      setShowLogoutConfirm(false)
      setIsLoggingOut(false)
      navigate('/login')
    }
  }
  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/dashboard"
            className={cn(
              'flex min-w-0 items-center gap-3 no-underline',
              collapsed && 'justify-center',
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <Sparkles size={18} />
            </div>

            {!collapsed && (
              <span className="truncate text-base font-semibold text-sidebar-foreground">
                CareerForge
              </span>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <ChevronLeft size={18} className="rotate-180" />
        </button>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.path

          return (
            <Link
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-2',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon size={18} className="shrink-0" />

              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>

                 
                </>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl p-2',
            collapsed && 'justify-center',
          )}
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {getInitials(user?.name)}
            </div>
          )}

          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {user?.name}
                </p>
              </div>

              <button
                type="button"
                aria-label="Logout"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Logout"
        message="Are you sure you want to logout from your account?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        onConfirm={handleLogout}
        confirmVariant="destructive"
        isLoading={isLoggingOut}
      />
    </aside>
  )
}
