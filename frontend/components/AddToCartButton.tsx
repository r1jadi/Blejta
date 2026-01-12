'use client'
import { useState } from 'react'
import useCart from '../lib/store'

export default function AddToCartButton({ product }: { product: any }) {
  const add = useCart(s => s.add)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedFootSize, setSelectedFootSize] = useState<string>('')

  const productType = product.productType || 'GENERIC'
  const availableSizes = Array.isArray(product.availableSizes) ? product.availableSizes : []
  const availableModels = Array.isArray(product.availableModels) ? product.availableModels : []
  const availableColors = Array.isArray(product.availableColors) ? product.availableColors : []
  const requiresFootSize = product.requiresFootSize || false
  const availableFootSizes = Array.isArray(product.availableFootSizes) ? product.availableFootSizes : []

  const handleAdd = () => {
    // Validate variant selection
    if (productType === 'CLOTHING' && !selectedSize) {
      alert('Please select a size')
      return
    }
    if (productType === 'PHONE_CASE' && !selectedModel) {
      alert('Please select an iPhone model')
      return
    }
    if (requiresFootSize && !selectedFootSize) {
      alert('Please select a foot size')
      return
    }

    const variant = productType === 'CLOTHING' 
      ? { type: 'size' as const, value: selectedSize }
      : productType === 'PHONE_CASE'
      ? { type: 'model' as const, value: selectedModel }
      : undefined

    add(product, qty, variant, selectedColor || undefined, selectedFootSize || undefined)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const canAddToCart = (productType === 'GENERIC' || 
    (productType === 'CLOTHING' && selectedSize) ||
    (productType === 'PHONE_CASE' && selectedModel)) &&
    (!requiresFootSize || selectedFootSize)

  return (
    <div className="space-y-4">
      {/* Variant Selectors */}
      {productType === 'CLOTHING' && availableSizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Size *
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size: string) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  selectedSize === size
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {productType === 'PHONE_CASE' && availableModels.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select iPhone Model *
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">-- Select Model --</option>
            {availableModels.map((model: string) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Color Selection - Available for all product types if colors are defined */}
      {availableColors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Color {availableColors.length > 0 ? '(Optional)' : ''}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color: string) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  selectedColor === color
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Foot Size Selection */}
      {requiresFootSize && availableFootSizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Foot Size (EU) *
          </label>
          <div className="flex flex-wrap gap-2">
            {availableFootSizes.map((size: string) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedFootSize(size)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  selectedFootSize === size
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity and Add to Cart */}
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
              : canAddToCart
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
          onClick={handleAdd}
          disabled={!canAddToCart}
        >
          {added ? '✓ Added to Cart!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
