'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../lib/auth-store'

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Wait for Zustand to hydrate from storage
    if (!isHydrated) {
      // Check periodically if hydration is complete
      const checkInterval = setInterval(() => {
        const store = useAuthStore.getState()
        if (store.isHydrated) {
          clearInterval(checkInterval)
          setIsChecking(false)
        }
      }, 50)

      // Timeout after 1 second to prevent infinite waiting
      setTimeout(() => {
        clearInterval(checkInterval)
        setIsChecking(false)
      }, 1000)

      return () => clearInterval(checkInterval)
    } else {
      setIsChecking(false)
    }
  }, [isHydrated])

  useEffect(() => {
    // Only check auth after hydration is complete
    if (!isChecking && isHydrated) {
      if (!isAuthenticated || !user) {
        router.push('/login')
        return
      }

      if (requireAdmin && user.role !== 'admin') {
        router.push('/')
        return
      }
    }
  }, [isChecking, isHydrated, isAuthenticated, user, requireAdmin, router])

  // Show loading state while checking
  if (isChecking || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check authentication after hydration
  if (!isAuthenticated || !user) {
    return null
  }

  // Check admin requirement
  if (requireAdmin && user.role !== 'admin') {
    return null
  }

  return <>{children}</>
}
