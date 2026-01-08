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

type Tab = 'orders' | 'products'

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
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

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    } else {
      fetchProducts()
    }
  }, [activeTab])

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
          </nav>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {ordersLoading ? (
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
          </>
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
      </div>
    </AuthGuard>
  )
}
