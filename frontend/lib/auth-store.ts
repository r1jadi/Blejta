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
  isHydrated: boolean // Track if state has been loaded from storage
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  updateUser: (user: User) => void
  setHydrated: () => void
  syncAuthState: () => void // Helper to sync isAuthenticated with user/token
}

// Custom storage that uses localStorage for users and sessionStorage for admins
const createRoleBasedStorage = () => {
  return {
    getItem: (name: string): string | null => {
      if (typeof window === 'undefined') return null
      try {
        // Try to get from sessionStorage first (for admins)
        const sessionData = sessionStorage.getItem(name)
        if (sessionData) {
          try {
            const parsed = JSON.parse(sessionData)
            // Check if it's an admin session
            if (parsed?.state?.user?.role === 'admin') {
              return sessionData
            }
          } catch (e) {
            // Invalid JSON in sessionStorage, try localStorage
          }
        }
        // Otherwise get from localStorage (for users)
        const localData = localStorage.getItem(name)
        if (localData) {
          try {
            const parsed = JSON.parse(localData)
            // Only return if it's not an admin (admins should be in sessionStorage)
            if (parsed?.state?.user?.role !== 'admin') {
              return localData
            }
          } catch (e) {
            // Invalid JSON, return null
            return null
          }
        }
        return null
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
      isHydrated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },
      syncAuthState: () => {
        const state = get()
        const shouldBeAuthenticated = !!(state.user && state.token)
        if (state.isAuthenticated !== shouldBeAuthenticated) {
          set({ isAuthenticated: shouldBeAuthenticated })
        }
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
      setHydrated: () => {
        set({ isHydrated: true })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => createRoleBasedStorage()),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating auth state:', error)
          }
          // Mark as hydrated and ensure isAuthenticated is set correctly
          if (state) {
            // Sync isAuthenticated with user/token state
            state.syncAuthState()
            // Set hydrated flag after a small delay to ensure state is ready
            setTimeout(() => {
              state.setHydrated()
            }, 0)
          }
        }
      },
    }
  )
)
