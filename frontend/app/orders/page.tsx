'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../../components/AuthGuard'
import API from '../../lib/api'

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200'
  }
}

function getPaymentStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'succeeded':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'canceled':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200'
  }
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const res = await API.get('/orders/my-orders')
      setOrders(res.data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login')
      } else {
        setError(error.response?.data?.message || 'Failed to load orders')
      }
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and track your order history</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600 text-lg mb-4">You haven't placed any orders yet.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium">Name:</span>
                        <span>{order.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium">Phone:</span>
                        <span>{order.phone}</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-700">
                        <span className="font-medium">Address:</span>
                        <span className="flex-1">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium">Order Date:</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Order Items ({Array.isArray(order.items) ? order.items.length : 0})</h4>
                      <div className="space-y-2">
                        {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{item.price?.toFixed(2)} €</p>
                              {item.qty > 1 && (
                                <p className="text-xs text-gray-500">({(item.price * item.qty).toFixed(2)} € total)</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:text-right space-y-3 lg:min-w-[180px]">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Subtotal</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {order.subtotal ? order.subtotal.toFixed(2) : '0.00'} €
                      </div>
                    </div>
                    {order.shippingCost !== null && order.shippingCost !== undefined && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Shipping</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {order.shippingCost.toFixed(2)} €
                        </div>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Total</div>
                      <div className="text-2xl font-bold text-primary-600">
                        {order.total ? order.total.toFixed(2) : '0.00'} €
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
