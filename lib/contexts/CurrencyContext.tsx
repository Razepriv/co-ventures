'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP'

interface CurrencyRates {
  INR: number
  USD: number
  EUR: number
  GBP: number
}

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convertPrice: (priceInINR: number) => number
  formatPrice: (priceInINR: number, showSymbol?: boolean) => string
  currencyRates: CurrencyRates
  currencySymbols: Record<Currency, string>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Exchange rates (INR as base currency)
const DEFAULT_RATES: CurrencyRates = {
  INR: 1,
  USD: 0.012,  // 1 INR = 0.012 USD
  EUR: 0.011,  // 1 INR = 0.011 EUR
  GBP: 0.0095  // 1 INR = 0.0095 GBP
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('INR')
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates>(DEFAULT_RATES)

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred-currency') as Currency
    if (savedCurrency && ['INR', 'USD', 'EUR', 'GBP'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency)
    }
  }, [])

  // Save currency to localStorage when changed
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('preferred-currency', newCurrency)
  }

  // Fetch live exchange rates (optional - can be enabled later)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Placeholder for real API call
        // const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR')
        // const data = await response.json()
        // setCurrencyRates({
        //   INR: 1,
        //   USD: data.rates.USD,
        //   EUR: data.rates.EUR,
        //   GBP: data.rates.GBP
        // })
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error)
      }
    }

    // Uncomment to enable live rates
    // fetchRates()
  }, [])

  // Convert price from INR to selected currency
  const convertPrice = (priceInINR: number): number => {
    return priceInINR * currencyRates[currency]
  }

  // Format price with currency symbol
  const formatPrice = (priceInINR: number, showSymbol: boolean = true): string => {
    const converted = convertPrice(priceInINR)
    const symbol = CURRENCY_SYMBOLS[currency]
    
    // Format based on currency
    let formatted: string
    
    if (currency === 'INR') {
      // Indian number format (₹45,00,000)
      formatted = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
      }).format(converted)
    } else {
      // International format ($540,000)
      formatted = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0
      }).format(converted)
    }
    
    return showSymbol ? `${symbol}${formatted}` : formatted
  }

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    convertPrice,
    formatPrice,
    currencyRates,
    currencySymbols: CURRENCY_SYMBOLS
  }

  return (
    <CurrencyContext.Provider value={value}>
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
