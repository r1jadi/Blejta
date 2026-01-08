import { create } from 'zustand'
import API from './api'
import { useAuthStore } from './auth-store'

type CartItem = { id: number; product: any; qty: number }

type State = {
  items: CartItem[]
  isLoading: boolean
  add: (product: any, qty?: number) => Promise<void>
  remove: (id: number) => Promise<void>
  clear: () => Promise<void>
  clearFrontendOnly: () => void // Clear only frontend state, keep backend
  loadFromBackend: () => Promise<void>
  syncToBackend: () => Promise<void>
}

const useCart = create<State>((set, get) => ({
  items: [],
  isLoading: false,
  
  // Load cart from backend
  loadFromBackend: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      set({ items: [] })
      return
    }

    set({ isLoading: true })
    try {
      const res = await API.get('/cart')
      const backendItems = Array.isArray(res.data.items) ? res.data.items : []
      
      if (backendItems.length === 0) {
        set({ items: [], isLoading: false })
        return
      }
      
      // Fetch product details for each cart item
      const productsRes = await API.get('/products')
      const products = productsRes.data
      
      const items: CartItem[] = backendItems
        .map((item: any) => {
          const product = products.find((p: any) => p.id === item.productId)
          if (!product) {
            console.warn(`Product ${item.productId} not found, skipping cart item`)
            return null
          }
          return {
            id: product.id,
            product,
            qty: item.qty || 1,
          }
        })
        .filter((item: CartItem | null): item is CartItem => item !== null)
      
      set({ items, isLoading: false })
    } catch (error: any) {
      console.error('Failed to load cart:', error)
      // If 401, user is not authenticated, clear cart
      if (error.response?.status === 401) {
        set({ items: [], isLoading: false })
      } else {
        set({ isLoading: false })
      }
    }
  },

  // Sync cart to backend
  syncToBackend: async () => {
    const { isAuthenticated, user } = useAuthStore.getState()
    if (!isAuthenticated || user?.role === 'admin') {
      // Don't sync cart for admins
      return
    }

    const { items } = get()
    try {
      await API.put('/cart', {
        items: items.map(item => ({
          productId: item.product.id,
          qty: item.qty,
          price: item.product.price,
        })),
      })
    } catch (error: any) {
      console.error('Failed to sync cart:', error)
      // Don't throw, just log the error
    }
  },

  add: async (product, qty = 1) => {
    set((state) => {
      const exists = state.items.find(i => i.id === product.id)
      let newItems: CartItem[]
      if (exists) {
        newItems = state.items.map(i => 
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        )
      } else {
        newItems = [...state.items, { id: product.id, product, qty }]
      }
      return { items: newItems }
    })
    
    // Sync to backend
    await get().syncToBackend()
  },

  remove: async (id) => {
    set((state) => ({ items: state.items.filter(i => i.id !== id) }))
    
    // Sync to backend
    await get().syncToBackend()
  },

  clear: async () => {
    set({ items: [] })
    
    // Clear on backend
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      try {
        await API.post('/cart/clear')
      } catch (error) {
        console.error('Failed to clear cart on backend:', error)
      }
    }
  },

  clearFrontendOnly: () => {
    // Clear only frontend state, keep cart in backend for next login
    set({ items: [] })
  },
}))

export default useCart
