import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

// Request interceptor: attach JWT token and Organization ID
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  const orgId = localStorage.getItem('activeOrganizationId')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (orgId) {
    config.headers['X-Organization-Id'] = orgId
  }
  return config
})

// Response interceptor: auto-logout on 401
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default client
