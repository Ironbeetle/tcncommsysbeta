import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import Providers from '@/lib/Providers'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-deep-blue via-primary-blue to-secondary-blue antialiased`}>
        <Providers>
          <div className="min-h-screen backdrop-blur-sm">
            {children}
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(30, 73, 118, 0.95)',
                color: 'white',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
              }
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
