'use client'
import { useState } from 'react'
import useCart from '../../lib/store'
import API from '../../lib/api'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const items = useCart(s => s.items)
  const clear = useCart(s => s.clear)
  const router = useRouter()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)

  async function placeOrder() {
    if (!name || !phone || !address) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const payload = {
        items: items.map(i => ({ productId: i.product.id, qty: i.qty, price: i.product.price })),
        name,
        phone,
        address,
        subtotal,
        shippingCost: 2.5,
        total: subtotal + 2.5,
        status: 'pending'
      }
      const res = await API.post('/orders', payload)
      clear()
      router.push(`/order-success/${res.data.id}`)
    } catch (e) {
      console.error('Order error:', e)
      alert('Error placing order. Please try again.')
    } finally { 
      setLoading(false) 
    }
  }

  const shipping = 2.5
  const total = subtotal + shipping

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-card p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="John Doe" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="+383 44 123 456" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                <textarea 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  placeholder="Street address, City, Postal code" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none" 
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-6">
              {items.map(i => (
                <div key={i.id} className="flex justify-between text-sm text-gray-600">
                  <span>{i.product.name} × {i.qty}</span>
                  <span>{(i.qty * i.product.price).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary-600">{total.toFixed(2)} €</span>
              </div>
            </div>
            <button 
              onClick={placeOrder} 
              disabled={loading || items.length === 0} 
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Placing order...
                </span>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
