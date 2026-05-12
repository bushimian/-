import request from '@/utils/request'
import { storage } from '@/utils/storage'

export const authAPI = {
  /**
   * 密码登录
   */
  async loginWithPassword({ username, password, captcha }) {
    try {
      const data = await request.post('/auth/login/password', {
        username,
        password,
        captcha
      })
      
      // 存储Token
      storage.set('access_token', data.access_token, 30)
      storage.set('refresh_token', data.refresh_token, 1440)
      storage.set('user_info', data.user_info, 1440)
      
      return data.user_info
    } catch (error) {
      throw error
    }
  },

  /**
   * 短信验证码登录
   */
  async loginWithSMS({ phone, code }) {
    try {
      const data = await request.post('/auth/login/sms', {
        phone,
        code
      })
      
      storage.set('access_token', data.access_token, 30)
      storage.set('refresh_token', data.refresh_token, 1440)
      storage.set('user_info', data.user_info, 1440)
      
      return data.user_info
    } catch (error) {
      throw error
    }
  },

  /**
   * 发送验证码
   */
  async sendSMSCode(phone) {
    return request.post('/auth/sms/send', { phone })
  },

  /**
   * 退出登录
   */
  async logout() {
    try {
      await request.post('/auth/logout')
    } finally {
      storage.clear()
    }
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser() {
    return storage.get('user_info')
  },

  /**
   * 检查是否已登录
   */
  isAuthenticated() {
    return !!storage.get('access_token')
  }
}