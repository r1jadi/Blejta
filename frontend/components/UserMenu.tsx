'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '../lib/auth-store'
import { useState, useRef, useEffect } from 'react'

export default function UserMenu() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
    router.refresh()
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
          Login
        </Link>
        <Link href="/signup" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span>{user.name}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-card-hover border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {user.role === 'admin' && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-primary-100 text-primary-800 rounded">
                Admin
              </span>
            )}
          </div>
          {user.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Admin Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
