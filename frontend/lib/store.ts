import { create } from 'zustand'

type CartItem = { id: number; product: any; qty: number }

type State = {
  items: CartItem[]
  add: (product: any, qty?: number) => void
  remove: (id: number) => void
  clear: () => void
}

const useCart = create<State>((set) => ({
  items: [],
  add: (product, qty = 1) => set((state) => {
    const exists = state.items.find(i => i.id === product.id)
    if (exists) {
      return { items: state.items.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i) }
    }
    return { items: [...state.items, { id: product.id, product, qty }] }
  }),
  remove: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
  clear: () => set({ items: [] }),
}))

export default useCart
