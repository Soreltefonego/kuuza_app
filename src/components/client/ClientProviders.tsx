'use client'

import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
          }}
        />
        {children}
      </CurrencyProvider>
    </ThemeProvider>
  )
}