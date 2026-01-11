import Link from 'next/link'

export default function Success({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white rounded-xl shadow-card p-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        <p className="text-lg text-gray-600 mb-2">
          Your order <span className="font-semibold text-primary-600">#{params.id}</span> has been received.
        </p>
        <p className="text-gray-600 mb-8">
          We will contact you by phone when your order is ready for delivery.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/products" 
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
