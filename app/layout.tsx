import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Cairo } from 'next/font/google'
import './globals.css'
import { ConditionalBalanceProvider } from '@/components/ConditionalBalanceProvider'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Play to Cash',
  description: 'Skill-based gaming platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" dir="ltr" className={`${jakarta.variable} ${cairo.variable}`}>
      <body className={jakarta.className}>
        <ConditionalBalanceProvider>
          {children}
        </ConditionalBalanceProvider>
        <div style={{ position: 'fixed', bottom: '4px', right: '4px', fontSize: '10px', opacity: 0.3, zIndex: 9999 }}>v2.5</div>
      </body>
    </html>
  )
}
