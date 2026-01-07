'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../lib/auth-store'

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }

    if (requireAdmin && user.role !== 'admin') {
      router.push('/')
      return
    }
  }, [isAuthenticated, user, requireAdmin, router])

  if (!isAuthenticated || !user) {
    return null
  }

  if (requireAdmin && user.role !== 'admin') {
    return null
  }

  return <>{children}</>
}
