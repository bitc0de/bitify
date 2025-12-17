import type { Metadata } from 'next'
import { ToastProvider } from '@/components/Toast'
import { PlayerProvider } from '@/components/PlayerContext'
import GlobalPlayer from '@/components/GlobalPlayer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bitify - Self-hosted youtube music player',
  description: 'Self-hosted YouTube music streaming app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-black text-white h-screen overflow-hidden" suppressHydrationWarning>
        <ToastProvider>
          <PlayerProvider>
            {children}
            <GlobalPlayer />
          </PlayerProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
