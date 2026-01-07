import { getApiUrl } from '../lib/api-url'
import ProductCard from '../components/ProductCard'

export default async function Home() {
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
      {/* Hero Section */}
      <div className="text-center mb-12 py-12 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-primary-600">Blejta</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover quality products at great prices. Your trusted local reseller in Kosovo.
        </p>
      </div>

      {/* Featured Products */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
        {products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-600">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
