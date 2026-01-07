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

export default function Admin() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await API.get('/orders')
        setOrders(res.data)
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.push('/login')
        }
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [router])

  return (
    <AuthGuard requireAdmin>
      <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">Manage and track all customer orders</p>
      </div>
      
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 text-lg">No orders yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((o: any) => (
            <div key={o.id} className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">Order #{o.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(o.status)}`}>
                      {o.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">Customer:</span>
                      <span>{o.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">Phone:</span>
                      <span>{o.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-700">
                      <span className="font-medium">Address:</span>
                      <span className="flex-1">{o.address}</span>
                    </div>
                  </div>
                </div>
                
                <div className="sm:text-right space-y-2">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-gray-900 mb-1">Items</div>
                    {Array.isArray(o.items) ? o.items.length : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-gray-900 mb-1">Created</div>
                    {new Date(o.createdAt).toLocaleDateString()}
                    <br />
                    <span className="text-xs">{new Date(o.createdAt).toLocaleTimeString()}</span>
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
