'use client'
import { useState } from 'react'
import useCart from '../lib/store'

export default function AddToCartButton({ product }: { product: any }) {
  const add = useCart(s => s.add)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    add(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => qty > 1 && setQty(qty - 1)}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
          disabled={qty <= 1}
        >
          −
        </button>
        <input 
          type="number" 
          min={1} 
          value={qty} 
          onChange={e => {
            const val = Number(e.target.value)
            if (val >= 1) setQty(val)
          }}
          className="w-16 px-2 py-2 text-center border-0 focus:ring-0 focus:outline-none" 
        />
        <button
          onClick={() => setQty(qty + 1)}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          +
        </button>
      </div>
      <button 
        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
          added 
            ? 'bg-green-600 text-white' 
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
        onClick={handleAdd}
      >
        {added ? '✓ Added to Cart!' : 'Add to Cart'}
      </button>
    </div>
  )
}
