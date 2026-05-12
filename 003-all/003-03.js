import { defineStore } from 'pinia'
import { authAPI } from '@/api/auth'
import { storage } from '@/utils/storage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    userName: (state) => state.user?.realName || '同学',
    studentId: (state) => state.user?.studentId || '',
    college: (state) => state.user?.college || '',
    major: (state) => state.user?.major || '',
  },

  actions: {
    /**
     * 初始化认证状态
     */
    initAuth() {
      const token = storage.get('access_token')
      const userInfo = storage.get('user_info')
      
      if (token && userInfo) {
        this.user = userInfo
        this.isAuthenticated = true
      }
    },

    /**
     * 密码登录
     */
    async loginWithPassword(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const userInfo = await authAPI.loginWithPassword(credentials)
        this.user = userInfo
        this.isAuthenticated = true
        return userInfo
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 短信登录
     */
    async loginWithSMS({ phone, code }) {
      this.loading = true
      this.error = null
      
      try {
        const userInfo = await authAPI.loginWithSMS({ phone, code })
        this.user = userInfo
        this.isAuthenticated = true
        return userInfo
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 退出登录
     */
    async logout() {
      await authAPI.logout()
      this.user = null
      this.isAuthenticated = false
    }
  }
})