import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: number
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

// Custom storage that uses localStorage for users and sessionStorage for admins
const createRoleBasedStorage = () => {
  return {
    getItem: (name: string): string | null => {
      try {
        // Try to get from sessionStorage first (for admins)
        const sessionData = typeof window !== 'undefined' ? sessionStorage.getItem(name) : null
        if (sessionData) {
          const parsed = JSON.parse(sessionData)
          if (parsed?.state?.user?.role === 'admin') {
            return sessionData
          }
        }
        // Otherwise get from localStorage (for users)
        return typeof window !== 'undefined' ? localStorage.getItem(name) : null
      } catch {
        return null
      }
    },
    setItem: (name: string, value: string): void => {
      if (typeof window === 'undefined') return
      try {
        const parsed = JSON.parse(value)
        const role = parsed?.state?.user?.role
        
        if (role === 'admin') {
          // Store in sessionStorage for admins (clears on page close)
          sessionStorage.setItem(name, value)
          // Clear from localStorage if it exists
          localStorage.removeItem(name)
        } else {
          // Store in localStorage for users (persists for 24h)
          localStorage.setItem(name, value)
          // Clear from sessionStorage if it exists
          sessionStorage.removeItem(name)
        }
      } catch {
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(name, value)
        }
      }
    },
    removeItem: (name: string): void => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(name)
        sessionStorage.removeItem(name)
      }
    },
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },
      logout: async () => {
        const { token } = get()
        // Call backend logout endpoint to clear cart
        if (token) {
          try {
            const API = (await import('./api')).default
            await API.post('/auth/logout')
          } catch (error) {
            console.error('Logout error:', error)
            // Continue with logout even if API call fails
          }
        }
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (user) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => createRoleBasedStorage()),
    }
  )
)
