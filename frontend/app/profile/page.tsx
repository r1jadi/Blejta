'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../lib/auth-store'
import AuthGuard from '../../components/AuthGuard'
import API from '../../lib/api'

export default function ProfilePage() {
  const router = useRouter()
  const { user, login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
    currentPassword: '',
  })

  const [errors, setErrors] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
    currentPassword: '',
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, email: user.email }))
    }
  }, [user])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors = {
      email: '',
      newPassword: '',
      confirmPassword: '',
      currentPassword: '',
    }

    let isValid = true

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
      isValid = false
    }

    // Validate current password (always required)
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
      isValid = false
    } else if (formData.currentPassword.length < 6) {
      newErrors.currentPassword = 'Current password must be at least 6 characters'
      isValid = false
    }

    // Validate new password if provided
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters'
        isValid = false
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password'
        isValid = false
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }))
    
    // Clear success/error messages
    setSuccess('')
    setError('')
  }

  const hasChanges = () => {
    return formData.email !== user?.email || formData.newPassword.length > 0
  }

  const isFormValid = () => {
    return (
      formData.email &&
      validateEmail(formData.email) &&
      formData.currentPassword.length >= 6 &&
      hasChanges() &&
      (!formData.newPassword || 
        (formData.newPassword.length >= 6 && 
         formData.newPassword === formData.confirmPassword))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    if (!hasChanges()) {
      setError('No changes to update')
      return
    }

    setLoading(true)

    try {
      const updateData: any = {
        currentPassword: formData.currentPassword,
      }

      if (formData.email !== user?.email) {
        updateData.email = formData.email
      }

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword
        updateData.confirmPassword = formData.confirmPassword
      }

      const response = await API.put('/auth/profile', updateData)

      // Update auth store with new user data and token
      login(response.data.user, response.data.token)

      setSuccess('Profile updated successfully!')
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
        currentPassword: '',
      }))

      // If password was changed, optionally redirect to login or show a message
      if (response.data.passwordChanged) {
        setTimeout(() => {
          setSuccess('Profile updated! Password changed successfully.')
        }, 100)
      }
    } catch (err: any) {
      console.error('Update profile error:', err)
      const errorMessage = err.response?.data?.message || 'Failed to update profile'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
            <p className="text-gray-600">Update your account information</p>
          </div>

          <div className="bg-white rounded-xl shadow-card p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password (Optional)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors ${
                        errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Leave blank to keep current password"
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your new password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors ${
                    errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your current password"
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Required for security verification</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                    isFormValid() && !loading
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Profile'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
                Reset your password
              </a>
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
