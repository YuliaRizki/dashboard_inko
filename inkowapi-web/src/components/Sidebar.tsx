'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, UserPlus, CreditCard, LogOut, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Register', icon: UserPlus, path: '/register' },
  { name: 'Payment', icon: CreditCard, path: '/payment' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed', error)
      router.push('/login')
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 glass-panel-premium p-4 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:top-4 md:left-4 md:h-[calc(100vh-2rem)] md:rounded-[32px] md:translate-x-0 ${
          isOpen ? 'translate-x-0 rounded-r-[32px]' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex flex-col items-center text-center relative">
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="absolute -right-2 -top-2 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] md:hidden"
          >
            <X size={20} />
          </button>

          <div className="w-full h-24 relative flex items-center justify-center">
            <img
              src="/images/side-bar.png"
              alt="INKOWAPI"
              className="h-full w-auto object-contain"
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] tracking-wide uppercase font-medium truncate w-full">
            Welcome back,{' '}
            <span className="text-[var(--text-primary)] font-bold">
              {session?.user?.name || '...'}
            </span>
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link key={item.path} href={item.path} onClick={onClose}>
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                    isActive
                      ? 'bg-[rgba(31,191,143,0.1)] text-[var(--green-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.03)]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1 h-6 bg-[var(--green-primary)] rounded-r-full"
                    />
                  )}

                  <item.icon
                    size={20}
                    className={
                      isActive
                        ? 'text-[var(--green-primary)]'
                        : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors'
                    }
                  />
                  <span className="font-medium text-sm tracking-wide">{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-muted)] hover:text-[#EF4444] transition-colors group rounded-xl hover:bg-[rgba(239,68,68,0.05)]"
          >
            <LogOut size={18} className="group-hover:text-[#EF4444] transition-colors" />
            <span className="font-medium text-sm">Terminate Session</span>
          </button>
        </div>
      </aside>
    </>
  )
}
