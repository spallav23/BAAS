import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = response.data
        localStorage.setItem('accessToken', accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getCurrentUser: () => api.get('/auth/me'),
  updateUser: (userId, data) => api.put(`/auth/user/${userId}`, data),
  deleteUser: (userId) => api.delete(`/auth/user/${userId}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyCode: (email, code) => api.post('/auth/verify-code', { email, code }),
  resetPassword: (email, code, newPassword) =>
    api.post('/auth/reset-password', { email, code, newPassword }),
  sendVerification: () => api.post('/auth/send-verification'),
  verifyEmail: (code) => api.post('/auth/verify-email', { code }),
}

// Cluster API
export const clusterAPI = {
  getClusters: () => api.get('/db/clusters'),
  getCluster: (clusterId) => api.get(`/db/clusters/${clusterId}`),
  createCluster: (data) => api.post('/db/clusters', data),
  updateCluster: (clusterId, data) =>
    api.put(`/db/clusters/${clusterId}`, data),
  deleteCluster: (clusterId) => api.delete(`/db/clusters/${clusterId}`),
}

// Data API
export const dataAPI = {
  getDocuments: (clusterId, params) =>
    api.get(`/db/clusters/${clusterId}/data`, { params }),
  getDocument: (clusterId, documentId) =>
    api.get(`/db/clusters/${clusterId}/data/${documentId}`),
  createDocument: (clusterId, data) =>
    api.post(`/db/clusters/${clusterId}/data`, data),
  updateDocument: (clusterId, documentId, data) =>
    api.put(`/db/clusters/${clusterId}/data/${documentId}`, data),
  deleteDocument: (clusterId, documentId) =>
    api.delete(`/db/clusters/${clusterId}/data/${documentId}`),
}

// Storage API
export const storageAPI = {
  // Buckets
  getBuckets: () => api.get('/storage/buckets'),
  getBucket: (bucketId) => api.get(`/storage/buckets/${bucketId}`),
  createBucket: (data) => api.post('/storage/buckets', data),
  updateBucket: (bucketId, data) => api.put(`/storage/buckets/${bucketId}`, data),
  deleteBucket: (bucketId) => api.delete(`/storage/buckets/${bucketId}`),
  
  // Files
  getFiles: (bucketId, params) =>
    api.get(`/storage/buckets/${bucketId}/files`, { params }),
  getFile: (bucketId, fileId) =>
    api.get(`/storage/buckets/${bucketId}/files/${fileId}`),
  uploadFile: (bucketId, formData) =>
    api.post(`/storage/buckets/${bucketId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  downloadFile: (bucketId, fileName) =>
    api.get(`/storage/buckets/${bucketId}/files/${fileName}/download`, {
      responseType: 'blob',
    }),
  deleteFile: (bucketId, fileId) =>
    api.delete(`/storage/buckets/${bucketId}/files/${fileId}`),
}

export default api

