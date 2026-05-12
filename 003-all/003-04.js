import request from '@/utils/request'

/**
 * AI助手API - 支持OpenAI/通义千问/文心一言等
 * 通过后端统一代理，避免前端暴露API Key
 */
export const aiAPI = {
  /**
   * 发送对话消息
   * @param {string} message - 用户输入
   * @param {Array} history - 历史对话记录
   */
  async chat(message, history = []) {
    return request.post('/ai/chat', {
      message,
      history: history.slice(-10), // 只保留最近10轮对话
      context: 'campus' // 校园场景上下文
    })
  },

  /**
   * 获取建议问题
   */
  async getSuggestions() {
    return request.get('/ai/suggestions')
  },

  /**
   * 流式对话（使用EventSource或WebSocket）
   */
  async chatStream(message, onChunk, onComplete, onError) {
    const token = localStorage.getItem('access_token')
    
    // 使用Server-Sent Events
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_BASE_URL}/ai/chat/stream?message=${encodeURIComponent(message)}&token=${token}`
    )
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.done) {
        eventSource.close()
        onComplete?.(data.fullResponse)
      } else {
        onChunk?.(data.chunk)
      }
    }
    
    eventSource.onerror = (error) => {
      eventSource.close()
      onError?.(error)
    }
    
    return () => eventSource.close()
  }
}