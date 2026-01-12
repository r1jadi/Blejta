'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import API from '../../../lib/api'

interface Order {
  id: number
  name: string
  phone: string
  address: string
  total: number
  paymentMethod: string
  paymentStatus: string
  status: string
  createdAt: string
}

export default function Success({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [id])

  async function fetchOrder() {
    try {
      const res = await API.get(`/orders/${id}`)
      setOrder(res.data)
    } catch (err) {
      console.error('Error fetching order:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    )
  }

  const isCashOnDelivery = order?.paymentMethod === 'cash_on_delivery'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-card p-8 sm:p-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600 mb-2">
            Your order <span className="font-semibold text-primary-600">#{id}</span> has been confirmed.
          </p>
        </div>

        {order && (
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium text-gray-900">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-medium text-gray-900">{order.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{order.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Address:</span>
                <span className="font-medium text-gray-900 text-right max-w-xs">{order.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-gray-900 text-lg">{order.total?.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium text-gray-900">
                  {isCashOnDelivery ? (
                    <span className="flex items-center gap-1">
                      💵 Cash on Delivery
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      💳 Card Payment
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'succeeded' 
                    ? 'text-green-600' 
                    : order.paymentStatus === 'cash_on_delivery'
                    ? 'text-blue-600'
                    : 'text-yellow-600'
                }`}>
                  {order.paymentStatus === 'succeeded' && '✓ Paid'}
                  {order.paymentStatus === 'cash_on_delivery' && 'Pay on Delivery'}
                  {order.paymentStatus === 'pending' && 'Pending'}
                </span>
              </div>
            </div>
          </div>
        )}

        {isCashOnDelivery ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💵</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Cash on Delivery Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Please prepare the exact amount: <strong>{order?.total?.toFixed(2)} €</strong></li>
                  <li>• Payment is due when you receive your order</li>
                  <li>• We will contact you by phone to confirm delivery time</li>
                  <li>• Make sure someone is available to receive the order</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Payment Confirmed</h3>
                <p className="text-sm text-green-800">
                  Your payment has been processed successfully. We will contact you by phone when your order is ready for delivery.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <p className="text-center text-gray-600 mb-6">
            We will contact you at <strong>{order?.phone}</strong> for delivery confirmation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
            >
              Continue Shopping
            </Link>
            <Link 
              href="/orders" 
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
