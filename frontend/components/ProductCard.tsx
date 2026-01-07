import Link from 'next/link'
import Image from 'next/image'

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: number
    images: string[] | any
    description?: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = Array.isArray(product.images) && product.images[0] 
    ? product.images[0] 
    : '/placeholder.jpg'

  return (
    <Link 
      href={`/products/${product.id}`}
      className="group relative bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            {product.price.toFixed(2)} €
          </span>
          <span className="text-sm text-primary-600 font-medium group-hover:translate-x-1 transition-transform inline-block">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}
