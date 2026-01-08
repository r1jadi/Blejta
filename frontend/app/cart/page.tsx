'use client'
import { useEffect } from 'react'
import useCart from '../../lib/store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../lib/auth-store'

export default function CartPage() {
  const items = useCart(s => s.items)
  const remove = useCart(s => s.remove)
  const clear = useCart(s => s.clear)
  const loadFromBackend = useCart(s => s.loadFromBackend)
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  // Ensure cart is loaded when page mounts
  useEffect(() => {
    if (isAuthenticated && user?.role === 'user' && items.length === 0) {
      loadFromBackend()
    }
  }, [isAuthenticated, user, items.length, loadFromBackend])

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const shipping = 2.5
  const total = subtotal + shipping

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
          <Link 
            href="/products" 
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(i => {
              const imageUrl = Array.isArray(i.product.images) && i.product.images[0] 
                ? i.product.images[0] 
                : '/placeholder.jpg'
              
              return (
                <div key={i.id} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-card hover:shadow-card-hover transition-all">
                  <img 
                    src={imageUrl} 
                    alt={i.product.name} 
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{i.product.name}</h3>
                    <div className="text-sm text-gray-600">
                      {i.qty} × {i.product.price.toFixed(2)} € = {(i.qty * i.product.price).toFixed(2)} €
                    </div>
                  </div>
                  <button 
                    onClick={() => remove(i.id)} 
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping.toFixed(2)} €</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-600">{total.toFixed(2)} €</span>
                </div>
              </div>
              
              <Link 
                href="/checkout" 
                className="block w-full text-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium mb-3"
              >
                Proceed to Checkout
              </Link>
              
              <button 
                onClick={() => clear()} 
                className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
