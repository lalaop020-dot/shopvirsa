import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout to avoid hanging requests
})

// Request Interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor for Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on unauthorized
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    // Network error or timeout (no response received)
    if (!error.response) {
      const networkError = new Error(
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Please check your connection and try again.'
          : 'Network error — unable to reach the server. Check your internet connection.'
      )
      networkError.isNetworkError = true
      return Promise.reject(networkError)
    }

    return Promise.reject(error)
  }
)

export default api

