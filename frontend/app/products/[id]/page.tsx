import { notFound } from 'next/navigation'
import AddToCartButton from '../../../components/AddToCartButton'
import { getApiUrl } from '../../../lib/api-url'
import Link from 'next/link'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const apiUrl = getApiUrl()
  let product = null
  
  try {
    const res = await fetch(`${apiUrl}/products/${params.id}`, { cache: 'no-store' })
    if (!res.ok) {
      notFound()
    }
    product = await res.json()
  } catch (error) {
    notFound()
  }

  if (!product) {
    notFound()
  }

  const imageUrl = Array.isArray(product.images) && product.images[0] 
    ? product.images[0] 
    : '/placeholder.jpg'

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/products" className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-6 transition-colors">
        ← Back to products
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="bg-white rounded-xl overflow-hidden shadow-card">
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-[500px] object-cover" 
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="text-3xl font-bold text-primary-600 mb-6">
              {product.price.toFixed(2)} €
            </div>
          </div>
          
          {product.description && (
            <div className="prose max-w-none">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}
          
          <div className="pt-6 border-t border-gray-200">
            <AddToCartButton product={product} />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-600">✓</span>
              <span>Fast delivery available</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-600">✓</span>
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
