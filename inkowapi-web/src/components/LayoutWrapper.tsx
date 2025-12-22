'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import React, { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/auth'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (isAuthPage) {
    return <main className="w-full h-full min-h-screen bg-[var(--bg-main)]">{children}</main>
  }

  return (
    <div className="flex h-screen w-full relative">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 glass-panel-premium rounded-xl text-[var(--text-primary)] md:hidden"
      >
        <Menu size={24} />
      </button>

      <main className="flex-1 ml-0 md:ml-80 mr-0 md:mr-4 h-full overflow-y-auto pt-20 md:pt-0 no-scrollbar">
        {children}
      </main>
    </div>
  )
}
