import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Inter, Outfit, Space_Grotesk } from 'next/font/google'
import AppLayout from '@/components/AppLayout'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit'
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

export const metadata: Metadata = {
  title: 'AI Inbox Assistant',
  description: 'Transform messy messages into structured tickets with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${spaceGrotesk.variable} font-sans bg-gray-50 dark:bg-slate-900`}>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  )
}

