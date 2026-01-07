'use client'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '../lib/stripe'
import { ReactNode } from 'react'

export default function StripeProvider({ children }: { children: ReactNode }) {
  const stripe = getStripe()
  
  if (!stripe) {
    return <>{children}</>
  }

  return (
    <Elements stripe={stripe}>
      {children}
    </Elements>
  )
}
