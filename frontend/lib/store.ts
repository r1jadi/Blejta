import { create } from 'zustand'
import API from './api'
import { useAuthStore } from './auth-store'

type CartItem = { 
  id: string; 
  product: any; 
  qty: number; 
  variant?: { type: 'size' | 'model' | 'color' | 'footSize'; value: string } 
  color?: string
  footSize?: string
}

// Generate unique ID for cart item (includes product ID and all variants)
function getCartItemId(
  productId: number, 
  variant?: { type: 'size' | 'model' | 'color' | 'footSize'; value: string },
  color?: string,
  footSize?: string
): string {
  const parts = [productId.toString()]
  if (variant) {
    parts.push(`${variant.type}-${variant.value}`)
  }
  if (color) {
    parts.push(`color-${color}`)
  }
  if (footSize) {
    parts.push(`footSize-${footSize}`)
  }
  return parts.join('-')
}

type State = {
  items: CartItem[]
  isLoading: boolean
  add: (product: any, qty?: number, variant?: { type: 'size' | 'model' | 'color' | 'footSize'; value: string }, color?: string, footSize?: string) => Promise<void>
  remove: (id: string) => Promise<void>
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
          const variant = item.variant || undefined
          const color = item.color || undefined
          const footSize = item.footSize || undefined
          return {
            id: getCartItemId(product.id, variant, color, footSize),
            product,
            qty: item.qty || 1,
            variant,
            color,
            footSize,
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
          variant: item.variant,
          color: item.color,
          footSize: item.footSize,
        })),
      })
    } catch (error: any) {
      console.error('Failed to sync cart:', error)
      // Don't throw, just log the error
    }
  },

  add: async (
    product, 
    qty = 1, 
    variant?: { type: 'size' | 'model' | 'color' | 'footSize'; value: string },
    color?: string,
    footSize?: string
  ) => {
    set((state) => {
      const itemId = getCartItemId(product.id, variant, color, footSize)
      const exists = state.items.find(i => i.id === itemId)
      
      let newItems: CartItem[]
      if (exists) {
        newItems = state.items.map(i => 
          i.id === itemId
            ? { ...i, qty: i.qty + qty } 
            : i
        )
      } else {
        newItems = [...state.items, { id: itemId, product, qty, variant, color, footSize }]
      }
      return { items: newItems }
    })
    
    // Sync to backend
    await get().syncToBackend()
  },

  remove: async (id: string) => {
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
