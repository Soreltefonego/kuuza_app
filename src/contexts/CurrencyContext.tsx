'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'CHF' | 'AUD' | 'CNY'

interface CurrencyRates {
  USD: number
  EUR: number
  GBP: number
  JPY: number
  CAD: number
  CHF: number
  AUD: number
  CNY: number
}

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convertAmount: (amount: number, from?: Currency, to?: Currency) => number
  formatCurrency: (amount: number, showSymbol?: boolean) => string
  currencySymbol: string
  rates: CurrencyRates
}

const defaultRates: CurrencyRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.36,
  CHF: 0.88,
  AUD: 1.53,
  CNY: 7.24
}

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  CHF: 'CHF',
  AUD: 'A$',
  CNY: '¥'
}

const currencyLocales: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'fr-FR',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CAD: 'en-CA',
  CHF: 'fr-CH',
  AUD: 'en-AU',
  CNY: 'zh-CN'
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD')
  const [rates, setRates] = useState<CurrencyRates>(defaultRates)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedCurrency = localStorage.getItem('currency') as Currency | null
    if (savedCurrency && savedCurrency in currencySymbols) {
      setCurrencyState(savedCurrency)
    }
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('currency', newCurrency)
  }

  const convertAmount = (amount: number, from: Currency = 'USD', to: Currency = currency): number => {
    if (from === to) return amount
    const amountInUSD = amount / rates[from]
    return amountInUSD * rates[to]
  }

  const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
    const convertedAmount = convertAmount(amount, 'USD', currency)
    const formatter = new Intl.NumberFormat(currencyLocales[currency], {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return formatter.format(convertedAmount)
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      convertAmount,
      formatCurrency,
      currencySymbol: currencySymbols[currency],
      rates
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}