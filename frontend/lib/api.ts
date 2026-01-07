import axios from 'axios'
import { getApiUrl } from './api-url'

const API = axios.create({ 
  baseURL: getApiUrl()
})

// Add token to requests if available
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const auth = JSON.parse(authStorage)
        const token = auth?.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
  return config
})

// Handle 401 errors (unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default API
