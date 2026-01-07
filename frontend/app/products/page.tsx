import { getApiUrl } from '../../lib/api-url'
import ProductCard from '../../components/ProductCard'

export default async function ProductsPage() {
  const apiUrl = getApiUrl()
  let products = []
  
  try {
    const res = await fetch(`${apiUrl}/products`, { cache: 'no-store' })
    if (res.ok) {
      products = await res.json()
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Shop All Products</h1>
        <p className="text-gray-600">Browse our complete collection</p>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-600 text-lg">No products available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
