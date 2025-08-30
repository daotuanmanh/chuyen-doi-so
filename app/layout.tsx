import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SettingsProvider } from '@/contexts/SettingsContext'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sales Analytics Dashboard',
  description: 'Hệ thống phân tích doanh thu thông minh với AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <SettingsProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </SettingsProvider>
      </body>
    </html>
  )
}
