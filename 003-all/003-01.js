import axios from 'axios'
import { storage } from './storage'
import router from '@/router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = storage.get('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { code, data, message } = response.data
    
    if (code === 200) {
      return data
    }
    
    // Token过期
    if (code === 401) {
      storage.remove('access_token')
      storage.remove('refresh_token')
      storage.remove('user_info')
      router.push('/')
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    
    return Promise.reject(new Error(message || '请求失败'))
  },
  error => {
    if (error.response?.status === 401) {
      storage.remove('access_token')
      storage.remove('refresh_token')
      storage.remove('user_info')
      router.push('/')
    }
    return Promise.reject(error)
  }
)

// Token刷新逻辑
let isRefreshing = false
let refreshSubscribers = []

request.refreshToken = async () => {
  const refreshToken = storage.get('refresh_token')
  if (!refreshToken) throw new Error('No refresh token')
  
  try {
    const { access_token, refresh_token } = await request.post('/auth/refresh', {
      refresh_token: refreshToken
    })
    storage.set('access_token', access_token, 30) // 30分钟过期
    storage.set('refresh_token', refresh_token, 1440) // 24小时过期
    return access_token
  } catch (error) {
    storage.clear()
    router.push('/')
    throw error
  }
}

export default request