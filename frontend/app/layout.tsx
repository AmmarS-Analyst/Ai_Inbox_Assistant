import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

