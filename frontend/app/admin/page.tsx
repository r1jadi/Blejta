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

type Tab = 'orders' | 'products' | 'users'

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const router = useRouter()

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    images: [''] as string[]
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Edit state
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    images: [''] as string[]
  })
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Delete state
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin'
  })
  const [userSubmitting, setUserSubmitting] = useState(false)
  const [userSubmitError, setUserSubmitError] = useState('')
  const [userSubmitSuccess, setUserSubmitSuccess] = useState(false)

  // User edit state
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [userEditForm, setUserEditForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin'
  })
  const [userUpdating, setUserUpdating] = useState(false)
  const [userUpdateError, setUserUpdateError] = useState('')
  const [userUpdateSuccess, setUserUpdateSuccess] = useState(false)

  // User delete state
  const [userToDelete, setUserToDelete] = useState<number | null>(null)
  const [userDeleting, setUserDeleting] = useState(false)
  const [userDeleteError, setUserDeleteError] = useState('')

  // Order form state
  const [orderForm, setOrderForm] = useState({
    userId: '',
    name: '',
    address: '',
    phone: '',
    items: [] as any[],
    subtotal: '',
    shippingCost: '',
    total: '',
    status: 'pending',
    paymentStatus: 'pending'
  })
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderSubmitError, setOrderSubmitError] = useState('')
  const [orderSubmitSuccess, setOrderSubmitSuccess] = useState(false)

  // Order edit state
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)
  const [orderEditForm, setOrderEditForm] = useState({
    userId: '',
    name: '',
    address: '',
    phone: '',
    items: [] as any[],
    subtotal: '',
    shippingCost: '',
    total: '',
    status: 'pending',
    paymentStatus: 'pending'
  })
  const [orderUpdating, setOrderUpdating] = useState(false)
  const [orderUpdateError, setOrderUpdateError] = useState('')
  const [orderUpdateSuccess, setOrderUpdateSuccess] = useState(false)

  // Order delete state
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)
  const [orderDeleting, setOrderDeleting] = useState(false)
  const [orderDeleteError, setOrderDeleteError] = useState('')

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
      fetchUsers() // Fetch users for dropdown
    } else if (activeTab === 'products') {
      fetchProducts()
    } else if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab])

  async function fetchOrders() {
    try {
      const res = await API.get('/orders/admin/all')
      setOrders(res.data)
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/login')
      }
      console.error('Failed to fetch orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  async function fetchProducts() {
    try {
      const res = await API.get('/products')
      setProducts(res.data)
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/login')
      }
      console.error('Failed to fetch products:', error)
    } finally {
      setProductsLoading(false)
    }
  }

  async function fetchUsers() {
    try {
      const res = await API.get('/users')
      setUsers(res.data)
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/login')
      }
      console.error('Failed to fetch users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  function addImageField() {
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  function removeImageField(index: number) {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  function updateImageField(index: number, value: string) {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess(false)
    setSubmitting(true)

    try {
      // Validate
      if (!productForm.name.trim()) {
        throw new Error('Product name is required')
      }
      if (!productForm.price || parseFloat(productForm.price) <= 0) {
        throw new Error('Valid price is required')
      }
      const validImages = productForm.images.filter(img => img.trim())
      if (validImages.length === 0) {
        throw new Error('At least one image URL is required')
      }

      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim() || undefined,
        price: parseFloat(productForm.price),
        images: validImages
      }

      await API.post('/products', payload)
      
      // Reset form
      setProductForm({
        name: '',
        description: '',
        price: '',
        images: ['']
      })
      setSubmitSuccess(true)
      
      // Refresh products list
      await fetchProducts()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || error.message || 'Failed to create product')
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(product: any) {
    setEditingProductId(product.id)
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      images: Array.isArray(product.images) && product.images.length > 0 
        ? product.images 
        : ['']
    })
    setUpdateError('')
    setUpdateSuccess(false)
  }

  function cancelEdit() {
    setEditingProductId(null)
    setEditForm({
      name: '',
      description: '',
      price: '',
      images: ['']
    })
    setUpdateError('')
    setUpdateSuccess(false)
  }

  function addEditImageField() {
    setEditForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  function removeEditImageField(index: number) {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  function updateEditImageField(index: number, value: string) {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }))
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingProductId) return

    setUpdateError('')
    setUpdateSuccess(false)
    setUpdating(true)

    try {
      // Validate
      if (!editForm.name.trim()) {
        throw new Error('Product name is required')
      }
      if (!editForm.price || parseFloat(editForm.price) <= 0) {
        throw new Error('Valid price is required')
      }
      const validImages = editForm.images.filter(img => img.trim())
      if (validImages.length === 0) {
        throw new Error('At least one image URL is required')
      }

      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        price: parseFloat(editForm.price),
        images: validImages
      }

      await API.put(`/products/${editingProductId}`, payload)
      
      setUpdateSuccess(true)
      cancelEdit()
      
      // Refresh products list
      await fetchProducts()
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (error: any) {
      setUpdateError(error.response?.data?.message || error.message || 'Failed to update product')
    } finally {
      setUpdating(false)
    }
  }

  function confirmDelete(productId: number) {
    setProductToDelete(productId)
    setDeleteError('')
  }

  function cancelDelete() {
    setProductToDelete(null)
    setDeleteError('')
  }

  async function handleDelete() {
    if (!productToDelete) return

    setDeleting(true)
    setDeleteError('')

    try {
      await API.delete(`/products/${productToDelete}`)
      setProductToDelete(null)
      
      // Refresh products list
      await fetchProducts()
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || error.message || 'Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  // User CRUD functions
  async function handleUserSubmit(e: React.FormEvent) {
    e.preventDefault()
    setUserSubmitError('')
    setUserSubmitSuccess(false)
    setUserSubmitting(true)

    try {
      if (!userForm.name.trim()) {
        throw new Error('Name is required')
      }
      if (!userForm.email.trim()) {
        throw new Error('Email is required')
      }
      if (!userForm.password || userForm.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      await API.post('/users', userForm)
      
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'user'
      })
      setUserSubmitSuccess(true)
      
      await fetchUsers()
      
      setTimeout(() => setUserSubmitSuccess(false), 3000)
    } catch (error: any) {
      setUserSubmitError(error.response?.data?.message || error.message || 'Failed to create user')
    } finally {
      setUserSubmitting(false)
    }
  }

  function startUserEdit(user: any) {
    setEditingUserId(user.id)
    setUserEditForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'user'
    })
    setUserUpdateError('')
    setUserUpdateSuccess(false)
  }

  function cancelUserEdit() {
    setEditingUserId(null)
    setUserEditForm({
      name: '',
      email: '',
      password: '',
      role: 'user'
    })
    setUserUpdateError('')
    setUserUpdateSuccess(false)
  }

  async function handleUserUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUserId) return

    setUserUpdateError('')
    setUserUpdateSuccess(false)
    setUserUpdating(true)

    try {
      if (!userEditForm.name.trim()) {
        throw new Error('Name is required')
      }
      if (!userEditForm.email.trim()) {
        throw new Error('Email is required')
      }
      
      const payload: any = {
        name: userEditForm.name.trim(),
        email: userEditForm.email.trim(),
        role: userEditForm.role
      }

      // Only include password if it was changed
      if (userEditForm.password) {
        if (userEditForm.password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        payload.password = userEditForm.password
      }

      await API.put(`/users/${editingUserId}`, payload)
      
      setUserUpdateSuccess(true)
      cancelUserEdit()
      
      await fetchUsers()
      
      setTimeout(() => setUserUpdateSuccess(false), 3000)
    } catch (error: any) {
      setUserUpdateError(error.response?.data?.message || error.message || 'Failed to update user')
    } finally {
      setUserUpdating(false)
    }
  }

  function confirmUserDelete(userId: number) {
    setUserToDelete(userId)
    setUserDeleteError('')
  }

  function cancelUserDelete() {
    setUserToDelete(null)
    setUserDeleteError('')
  }

  async function handleUserDelete() {
    if (!userToDelete) return

    setUserDeleting(true)
    setUserDeleteError('')

    try {
      await API.delete(`/users/${userToDelete}`)
      setUserToDelete(null)
      
      await fetchUsers()
    } catch (error: any) {
      setUserDeleteError(error.response?.data?.message || error.message || 'Failed to delete user')
    } finally {
      setUserDeleting(false)
    }
  }

  // Order CRUD functions
  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault()
    setOrderSubmitError('')
    setOrderSubmitSuccess(false)
    setOrderSubmitting(true)

    try {
      if (!orderForm.name.trim()) {
        throw new Error('Customer name is required')
      }
      if (!orderForm.address.trim()) {
        throw new Error('Address is required')
      }
      if (!orderForm.phone.trim()) {
        throw new Error('Phone is required')
      }

      const payload: any = {
        userId: orderForm.userId ? parseInt(orderForm.userId) : null,
        name: orderForm.name.trim(),
        address: orderForm.address.trim(),
        phone: orderForm.phone.trim(),
        items: orderForm.items.length > 0 ? orderForm.items : [],
        subtotal: orderForm.subtotal ? parseFloat(orderForm.subtotal) : 0,
        shippingCost: orderForm.shippingCost ? parseFloat(orderForm.shippingCost) : 0,
        total: orderForm.total ? parseFloat(orderForm.total) : 0,
        status: orderForm.status,
        paymentStatus: orderForm.paymentStatus
      }

      await API.post('/orders/admin/create', payload)
      
      setOrderForm({
        userId: '',
        name: '',
        address: '',
        phone: '',
        items: [],
        subtotal: '',
        shippingCost: '',
        total: '',
        status: 'pending',
        paymentStatus: 'pending'
      })
      setOrderSubmitSuccess(true)
      
      await fetchOrders()
      
      setTimeout(() => setOrderSubmitSuccess(false), 3000)
    } catch (error: any) {
      setOrderSubmitError(error.response?.data?.message || error.message || 'Failed to create order')
    } finally {
      setOrderSubmitting(false)
    }
  }

  function startOrderEdit(order: any) {
    setEditingOrderId(order.id)
    setOrderEditForm({
      userId: order.userId?.toString() || '',
      name: order.name || '',
      address: order.address || '',
      phone: order.phone || '',
      items: Array.isArray(order.items) ? order.items : [],
      subtotal: order.subtotal?.toString() || '',
      shippingCost: order.shippingCost?.toString() || '',
      total: order.total?.toString() || '',
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'pending'
    })
    setOrderUpdateError('')
    setOrderUpdateSuccess(false)
  }

  function cancelOrderEdit() {
    setEditingOrderId(null)
    setOrderEditForm({
      userId: '',
      name: '',
      address: '',
      phone: '',
      items: [],
      subtotal: '',
      shippingCost: '',
      total: '',
      status: 'pending',
      paymentStatus: 'pending'
    })
    setOrderUpdateError('')
    setOrderUpdateSuccess(false)
  }

  async function handleOrderUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingOrderId) return

    setOrderUpdateError('')
    setOrderUpdateSuccess(false)
    setOrderUpdating(true)

    try {
      if (!orderEditForm.name.trim()) {
        throw new Error('Customer name is required')
      }
      if (!orderEditForm.address.trim()) {
        throw new Error('Address is required')
      }
      if (!orderEditForm.phone.trim()) {
        throw new Error('Phone is required')
      }

      const payload: any = {
        userId: orderEditForm.userId ? parseInt(orderEditForm.userId) : null,
        name: orderEditForm.name.trim(),
        address: orderEditForm.address.trim(),
        phone: orderEditForm.phone.trim(),
        items: orderEditForm.items,
        subtotal: orderEditForm.subtotal ? parseFloat(orderEditForm.subtotal) : 0,
        shippingCost: orderEditForm.shippingCost ? parseFloat(orderEditForm.shippingCost) : 0,
        total: orderEditForm.total ? parseFloat(orderEditForm.total) : 0,
        status: orderEditForm.status,
        paymentStatus: orderEditForm.paymentStatus
      }

      await API.put(`/orders/${editingOrderId}`, payload)
      
      setOrderUpdateSuccess(true)
      cancelOrderEdit()
      
      await fetchOrders()
      
      setTimeout(() => setOrderUpdateSuccess(false), 3000)
    } catch (error: any) {
      setOrderUpdateError(error.response?.data?.message || error.message || 'Failed to update order')
    } finally {
      setOrderUpdating(false)
    }
  }

  function confirmOrderDelete(orderId: number) {
    setOrderToDelete(orderId)
    setOrderDeleteError('')
  }

  function cancelOrderDelete() {
    setOrderToDelete(null)
    setOrderDeleteError('')
  }

  async function handleOrderDelete() {
    if (!orderToDelete) return

    setOrderDeleting(true)
    setOrderDeleteError('')

    try {
      await API.delete(`/orders/${orderToDelete}`)
      setOrderToDelete(null)
      
      await fetchOrders()
    } catch (error: any) {
      setOrderDeleteError(error.response?.data?.message || error.message || 'Failed to delete order')
    } finally {
      setOrderDeleting(false)
    }
  }

  return (
    <AuthGuard requireAdmin>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage orders and products</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'products'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Users
            </button>
          </nav>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            {/* Add Order Form */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Order</h2>
              
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="order-user" className="block text-sm font-medium text-gray-700 mb-1">
                      User (Optional)
                    </label>
                    <select
                      id="order-user"
                      value={orderForm.userId}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, userId: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">No User (Guest Order)</option>
                      {users.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="order-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      id="order-name"
                      value={orderForm.name}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="order-address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    id="order-address"
                    value={orderForm.address}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, address: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="order-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="order-phone"
                      value={orderForm.phone}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="order-status" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Status *
                    </label>
                    <select
                      id="order-status"
                      value={orderForm.status}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="order-subtotal" className="block text-sm font-medium text-gray-700 mb-1">
                      Subtotal (€)
                    </label>
                    <input
                      type="number"
                      id="order-subtotal"
                      step="0.01"
                      min="0"
                      value={orderForm.subtotal}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, subtotal: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="order-shipping" className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping (€)
                    </label>
                    <input
                      type="number"
                      id="order-shipping"
                      step="0.01"
                      min="0"
                      value={orderForm.shippingCost}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, shippingCost: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="order-total" className="block text-sm font-medium text-gray-700 mb-1">
                      Total (€)
                    </label>
                    <input
                      type="number"
                      id="order-total"
                      step="0.01"
                      min="0"
                      value={orderForm.total}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, total: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {orderSubmitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {orderSubmitError}
                  </div>
                )}

                {orderSubmitSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    Order created successfully!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {orderSubmitting ? 'Creating...' : 'Create Order'}
                </button>
              </form>
            </div>

            {/* Orders List */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Orders {orders.length > 0 && <span className="text-lg text-gray-500 font-normal">({orders.length})</span>}
              </h2>
              
              {ordersLoading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-600 text-lg">No orders yet. Create your first order above!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.map((o: any) => (
                    <div key={o.id} className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-all">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
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
                                {o.user && (
                                  <span className="text-xs text-gray-500">(User: {o.user.email})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="font-medium">Phone:</span>
                                <span>{o.phone}</span>
                              </div>
                              <div className="flex items-start gap-2 text-gray-700">
                                <span className="font-medium">Address:</span>
                                <span className="flex-1">{o.address}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="font-medium">Total:</span>
                                <span className="text-lg font-bold text-primary-600">{o.total ? o.total.toFixed(2) : '0.00'} €</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="font-medium">Payment:</span>
                                <span className="flex items-center gap-1">
                                  {o.paymentMethod === 'cash_on_delivery' ? (
                                    <>
                                      <span>💵</span>
                                      <span>Cash on Delivery</span>
                                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">COD</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>💳</span>
                                      <span>Card</span>
                                      {o.paymentStatus === 'succeeded' && (
                                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Paid</span>
                                      )}
                                    </>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 text-xs">
                                <span className="font-medium">Items:</span>
                                <span>{Array.isArray(o.items) ? o.items.length : 0}</span>
                                <span className="mx-2">•</span>
                                <span className="font-medium">Created:</span>
                                <span>{new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => startOrderEdit(o)}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => confirmOrderDelete(o.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Order Modal */}
            {editingOrderId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Edit Order</h2>
                      <button
                        onClick={cancelOrderEdit}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={handleOrderUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edit-order-user" className="block text-sm font-medium text-gray-700 mb-1">
                            User (Optional)
                          </label>
                          <select
                            id="edit-order-user"
                            value={orderEditForm.userId}
                            onChange={(e) => setOrderEditForm(prev => ({ ...prev, userId: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">No User (Guest Order)</option>
                            {users.map((user: any) => (
                              <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="edit-order-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            id="edit-order-name"
                            value={orderEditForm.name}
                            onChange={(e) => setOrderEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="edit-order-address" className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <textarea
                          id="edit-order-address"
                          value={orderEditForm.address}
                          onChange={(e) => setOrderEditForm(prev => ({ ...prev, address: e.target.value }))}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edit-order-phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            id="edit-order-phone"
                            value={orderEditForm.phone}
                            onChange={(e) => setOrderEditForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-order-status" className="block text-sm font-medium text-gray-700 mb-1">
                            Order Status *
                          </label>
                          <select
                            id="edit-order-status"
                            value={orderEditForm.status}
                            onChange={(e) => setOrderEditForm(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="edit-order-subtotal" className="block text-sm font-medium text-gray-700 mb-1">
                            Subtotal (€)
                          </label>
                          <input
                            type="number"
                            id="edit-order-subtotal"
                            step="0.01"
                            min="0"
                            value={orderEditForm.subtotal}
                            onChange={(e) => setOrderEditForm(prev => ({ ...prev, subtotal: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-order-shipping" className="block text-sm font-medium text-gray-700 mb-1">
                            Shipping (€)
                          </label>
                          <input
                            type="number"
                            id="edit-order-shipping"
                            step="0.01"
                            min="0"
                            value={orderEditForm.shippingCost}
                            onChange={(e) => setOrderEditForm(prev => ({ ...prev, shippingCost: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-order-total" className="block text-sm font-medium text-gray-700 mb-1">
                            Total (€)
                          </label>
                          <input
                            type="number"
                            id="edit-order-total"
                            step="0.01"
                            min="0"
                            value={orderEditForm.total}
                            onChange={(e) => setOrderEditForm(prev => ({ ...prev, total: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      {orderUpdateError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                          {orderUpdateError}
                        </div>
                      )}

                      {orderUpdateSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                          Order updated successfully!
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={cancelOrderEdit}
                          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={orderUpdating}
                          className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {orderUpdating ? 'Updating...' : 'Update Order'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Order Confirmation Modal */}
            {orderToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Order</h2>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to delete this order? This action cannot be undone.
                    </p>

                    {orderDeleteError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {orderDeleteError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={cancelOrderDelete}
                        disabled={orderDeleting}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleOrderDelete}
                        disabled={orderDeleting}
                        className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {orderDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            {/* Add Product Form */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (€) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URLs *
                  </label>
                  {productForm.images.map((img, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => updateImageField(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {productForm.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Add Another Image
                  </button>
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    Product created successfully!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Product'}
                </button>
              </form>
            </div>

            {/* Products List */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Products {products.length > 0 && <span className="text-lg text-gray-500 font-normal">({products.length})</span>}
              </h2>
              
              {productsLoading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-600 text-lg">No products yet. Add your first product above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p: any) => (
                    <div key={p.id} className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-card-hover transition-all">
                      <div className="aspect-square relative overflow-hidden bg-gray-100">
                        <img
                          src={Array.isArray(p.images) && p.images[0] ? p.images[0] : '/placeholder.jpg'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {p.name}
                        </h3>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xl font-bold text-gray-900">
                            {p.price?.toFixed(2)} €
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(p)}
                            className="flex-1 bg-primary-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
                            type="button"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(p.id)}
                            className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                            type="button"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Product Modal */}
            {editingProductId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          id="edit-name"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id="edit-description"
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">
                          Price (€) *
                        </label>
                        <input
                          type="number"
                          id="edit-price"
                          step="0.01"
                          min="0"
                          value={editForm.price}
                          onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URLs *
                        </label>
                        {editForm.images.map((img, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="url"
                              value={img}
                              onChange={(e) => updateEditImageField(index, e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                            {editForm.images.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEditImageField(index)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addEditImageField}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          + Add Another Image
                        </button>
                      </div>

                      {updateError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                          {updateError}
                        </div>
                      )}

                      {updateSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                          Product updated successfully!
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={updating}
                          className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating ? 'Updating...' : 'Update Product'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {productToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Product</h2>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to delete this product? This action cannot be undone.
                    </p>

                    {deleteError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {deleteError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={cancelDelete}
                        disabled={deleting}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            {/* Add User Form */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New User</h2>
              
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="user-name"
                    value={userForm.name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="user-email"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="user-password"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    minLength={6}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                <div>
                  <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    id="user-role"
                    value={userForm.role}
                    onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {userSubmitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {userSubmitError}
                  </div>
                )}

                {userSubmitSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    User created successfully!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={userSubmitting}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {userSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </form>
            </div>

            {/* Users List */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Users {users.length > 0 && <span className="text-lg text-gray-500 font-normal">({users.length})</span>}
              </h2>
              
              {usersLoading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-600 text-lg">No users yet. Add your first user above!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {users.map((user: any) => (
                    <div key={user.id} className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800 border-purple-200' 
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}>
                              {user.role.toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <span className="font-medium">Email:</span>
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-xs">
                              <span className="font-medium">User ID:</span>
                              <span>#{user.id}</span>
                            </div>
                            {user.createdAt && (
                              <div className="flex items-center gap-2 text-gray-600 text-xs">
                                <span className="font-medium">Created:</span>
                                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => startUserEdit(user)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => confirmUserDelete(user.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit User Modal */}
            {editingUserId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                      <button
                        onClick={cancelUserEdit}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={handleUserUpdate} className="space-y-4">
                      <div>
                        <label htmlFor="edit-user-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="edit-user-name"
                          value={userEditForm.name}
                          onChange={(e) => setUserEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-user-email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="edit-user-email"
                          value={userEditForm.email}
                          onChange={(e) => setUserEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-user-password" className="block text-sm font-medium text-gray-700 mb-1">
                          Password (leave blank to keep unchanged)
                        </label>
                        <input
                          type="password"
                          id="edit-user-password"
                          value={userEditForm.password}
                          onChange={(e) => setUserEditForm(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          minLength={6}
                        />
                        <p className="mt-1 text-xs text-gray-500">Minimum 6 characters if changing</p>
                      </div>

                      <div>
                        <label htmlFor="edit-user-role" className="block text-sm font-medium text-gray-700 mb-1">
                          Role *
                        </label>
                        <select
                          id="edit-user-role"
                          value={userEditForm.role}
                          onChange={(e) => setUserEditForm(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {userUpdateError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                          {userUpdateError}
                        </div>
                      )}

                      {userUpdateSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                          User updated successfully!
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={cancelUserEdit}
                          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={userUpdating}
                          className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {userUpdating ? 'Updating...' : 'Update User'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Delete User Confirmation Modal */}
            {userToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete User</h2>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to delete this user? This action cannot be undone and will also delete their cart and any associated data.
                    </p>

                    {userDeleteError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {userDeleteError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={cancelUserDelete}
                        disabled={userDeleting}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUserDelete}
                        disabled={userDeleting}
                        className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {userDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
