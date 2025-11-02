import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Inter, Outfit, Space_Grotesk } from 'next/font/google'
import Nav from '@/components/Nav'

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
      <body className={`${inter.variable} ${outfit.variable} ${spaceGrotesk.variable} font-sans`}>
        <Providers>
          <Nav />
          <main className="pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}

