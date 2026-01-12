'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import useCart from '../../lib/store'
import API from '../../lib/api'
import { useAuthStore } from '../../lib/auth-store'
import AuthGuard from '../../components/AuthGuard'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

function CheckoutForm({ orderId, total }: { orderId: number; total: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const clear = useCart(s => s.clear)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || 'An error occurred')
        setLoading(false)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success/${orderId}`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        setLoading(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        try {
          await API.post('/payments/confirm', {
            paymentIntentId: paymentIntent.id,
          })
        } catch (err) {
          console.error('Error confirming payment on backend:', err)
        }
        
        clear()
        router.push(`/order-success/${orderId}`)
      } else {
        setError('Payment status is not clear. Please check your order status.')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>
        <PaymentElement />
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing payment...
          </span>
        ) : (
          `Pay ${total.toFixed(2)} €`
        )}
      </button>
    </form>
  )
}

function CheckoutContent() {
  const items = useCart(s => s.items)
  const clear = useCart(s => s.clear)
  const router = useRouter()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash_on_delivery'>('card')
  const [orderId, setOrderId] = useState<number | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'info' | 'payment'>('info')
  const { user } = useAuthStore()

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const shipping = 0
  const total = subtotal + shipping

  useEffect(() => {
    if (step === 'payment' && orderId && paymentMethod === 'card' && !clientSecret) {
      createPaymentIntent()
    }
  }, [step, orderId, paymentMethod])

  async function createOrder() {
    if (!name || !phone || !address) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const payload = {
        items: items.map(i => ({ 
          productId: i.product.id, 
          qty: i.qty, 
          price: i.product.price,
          variant: i.variant,
          color: i.color,
          footSize: i.footSize
        })),
        name,
        phone,
        address,
        subtotal,
        shippingCost: shipping,
        total,
        status: 'pending',
        paymentMethod: paymentMethod,
      }
      const res = await API.post('/orders', payload)
      setOrderId(res.data.id)
      
      // If cash on delivery, skip payment and go directly to success
      if (paymentMethod === 'cash_on_delivery') {
        clear()
        router.push(`/order-success/${res.data.id}`)
      } else {
        setStep('payment')
      }
    } catch (e) {
      console.error('Order error:', e)
      alert('Error creating order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function createPaymentIntent() {
    if (!orderId) return

    try {
      const res = await API.post('/payments/create-intent', {
        amount: total,
        orderId,
      })
      setClientSecret(res.data.clientSecret)
    } catch (e: any) {
      console.error('Payment intent error:', e)
      
      // Check if error is about Stripe not being configured
      const errorMessage = e.response?.data?.message || e.message || 'Error initializing payment'
      const isStripeNotConfigured = errorMessage.toLowerCase().includes('stripe is not configured') || 
                                     errorMessage.toLowerCase().includes('stripe_secret_key')
      
      if (isStripeNotConfigured) {
        // Show user-friendly message and suggest cash on delivery
        alert(
          'Card payments are not available because Stripe is not configured.\n\n' +
          'Please go back and select "Cash on Delivery" as your payment method.\n\n' +
          'To enable card payments, configure STRIPE_SECRET_KEY in your backend .env file.'
        )
        // Go back to info step so user can select cash on delivery
        setStep('info')
        setClientSecret(null)
      } else {
        alert(`Payment Error: ${errorMessage}. Please try again later.`)
        setStep('info')
        setClientSecret(null)
      }
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 'info' ? (
            <div className="space-y-6">
              {/* Delivery Information */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="John Doe" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      placeholder="+383 44 123 456" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                    <textarea 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      placeholder="Street address, City, Postal code" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none" 
                      rows={4}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-primary-600 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💳</span>
                        <div>
                          <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                          <p className="text-sm text-gray-600">Pay securely online with your card</p>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cash_on_delivery' 
                      ? 'border-primary-600 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash_on_delivery')}
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💵</span>
                        <div>
                          <p className="font-semibold text-gray-900">Cash on Delivery</p>
                          <p className="text-sm text-gray-600">Pay with cash when you receive your order</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={createOrder}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : paymentMethod === 'cash_on_delivery' ? (
                  'Place Order'
                ) : (
                  'Continue to Payment'
                )}
              </button>
            </div>
          ) : (
            clientSecret && stripePromise ? (
              <div className="bg-white rounded-xl shadow-card p-6 mb-6">
                <button
                  onClick={() => setStep('info')}
                  className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to delivery information
                </button>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm orderId={orderId!} total={total} />
                </Elements>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-card p-6 mb-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Initializing payment...</p>
              </div>
            )
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-6">
              {items.map(i => (
                <div key={i.id} className="flex justify-between text-sm text-gray-600">
                  <span>{i.product.name} × {i.qty}</span>
                  <span>{(i.qty * i.product.price).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary-600">{total.toFixed(2)} €</span>
              </div>
            </div>
            
            {paymentMethod === 'cash_on_delivery' && step === 'info' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Cash on Delivery:</span> You will pay {total.toFixed(2)} € in cash when you receive your order.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutContent />
    </AuthGuard>
  )
}
