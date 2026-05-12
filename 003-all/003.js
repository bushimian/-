import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_STORAGE_SECRET || 'ecut-default-key'

/**
 * 加密存储工具
 */
export const storage = {
  set(key, value, expiryMinutes = null) {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        expiry: expiryMinutes ? Date.now() + expiryMinutes * 60 * 1000 : null
      }
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        SECRET_KEY
      ).toString()
      localStorage.setItem(key, encrypted)
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  },

  get(key) {
    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null

      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))

      if (data.expiry && Date.now() > data.expiry) {
        this.remove(key)
        return null
      }

      return data.value
    } catch (error) {
      this.remove(key)
      return null
    }
  },

  remove(key) {
    localStorage.removeItem(key)
  },

  clear() {
    localStorage.clear()
  }
}