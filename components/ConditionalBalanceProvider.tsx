'use client'

import { usePathname } from 'next/navigation'
import { BalanceProvider } from '@/contexts/BalanceContext'

export function ConditionalBalanceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  if (isAdminPage) {
    // Admin pages don't need BalanceProvider
    return <>{children}</>
  }

  // Regular pages use BalanceProvider
  return <BalanceProvider>{children}</BalanceProvider>
}
