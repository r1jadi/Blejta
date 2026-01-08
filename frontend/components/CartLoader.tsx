'use client'
import { useEffect } from 'react'
import { useAuthStore } from '../lib/auth-store'
import useCart from '../lib/store'

export default function CartLoader() {
  const { isAuthenticated, user } = useAuthStore()
  const loadFromBackend = useCart(s => s.loadFromBackend)

  useEffect(() => {
    // Load cart from backend when user is authenticated
    if (isAuthenticated && user?.role === 'user') {
      loadFromBackend()
    }
  }, [isAuthenticated, user, loadFromBackend])

  return null // This component doesn't render anything
}
