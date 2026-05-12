<template>
  <div class="card card--ai">
    <div class="card__header">
      <span>🤖</span>
      <h3 class="card__title">AI校园助手 · 全能问答</h3>
      <span v-if="isTyping" class="typing-indicator">思考中...</span>
    </div>
    
    <div class="chat">
      <div class="chat__messages" ref="chatBox">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role === 'user' ? 'message--user' : 'message--ai']"
        >
          <div class="message__content">{{ msg.content }}</div>
          <div class="message__time">{{ msg.time }}</div>
        </div>
      </div>
      
      <div class="chat__input">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="输入问题，如：核工程考研方向？"
          @keypress.enter="sendMessage"
          :disabled="isTyping"
          aria-label="AI助手提问框"
        />
        <button
          @click="sendMessage"
          class="chat__btn"
          :disabled="!inputMessage.trim() || isTyping"
        >
          {{ isTyping ? '思考中' : '发送' }}
        </button>
      </div>
      
      <div class="quick-questions">
        <span
          v-for="q in quickQuestions"
          :key="q"
          class="quick-q"
          @click="selectQuickQuestion(q)"
        >
          {{ q.icon }} {{ q.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, onMounted, watch } from 'vue'
import { aiAPI } from '@/api/ai'

export default {
  name: 'AIAssistant',
  setup() {
    const chatBox = ref(null)
    const inputMessage = ref('')
    const isTyping = ref(false)
    const messages = ref([])
    
    const quickQuestions = [
      { icon: '💼', label: '就业前景', question: '核工程与核技术专业未来就业前景如何？' },
      { icon: '📄', label: '转专业政策', question: '东华理工大学转专业政策是什么？' },
      { icon: '🌏', label: '出国交流', question: '学校有哪些出国交流项目？' },
      { icon: '⚛️', label: '重点实验室', question: '请介绍一下核资源与环境国家重点实验室。' },
      { icon: '🏅', label: '竞赛辅导', question: '最近有创新创业竞赛辅导吗？' }
    ]

    // 初始化欢迎消息
    onMounted(() => {
      messages.value.push({
        role: 'ai',
        content: '✨ 你好！我是东华理工AI助手，基于大语言模型，可以帮你解答：\n📖 专业学习指导\n📅 教务政策咨询\n🏆 竞赛与科研信息\n💼 就业与升学规划\n🌍 校园生活服务\n\n请问有什么可以帮你的？',
        time: formatTime(new Date())
      })
    })

    // 自动滚动到底部
    watch(messages, async () => {
      await nextTick()
      if (chatBox.value) {
        chatBox.value.scrollTop = chatBox.value.scrollHeight
      }
    }, { deep: true })

    const scrollToBottom = async () => {
      await nextTick()
      if (chatBox.value) {
        chatBox.value.scrollTop = chatBox.value.scrollHeight
      }
    }

    const formatTime = (date) => {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    const sendMessage = async () => {
      const text = inputMessage.value.trim()
      if (!text || isTyping.value) return

      // 添加用户消息
      messages.value.push({
        role: 'user',
        content: text,
        time: formatTime(new Date())
      })
      inputMessage.value = ''
      
      // 添加AI加载状态
      isTyping.value = true
      messages.value.push({
        role: 'ai',
        content: '正在思考...',
        time: formatTime(new Date()),
        loading: true
      })
      await scrollToBottom()

      try {
        // 调用AI API
        const history = messages.value
          .filter(m => !m.loading)
          .slice(-10)
          .map(m => ({
            role: m.role,
            content: m.content
          }))

        const response = await aiAPI.chat(text, history)
        
        // 替换加载消息
        messages.value.pop()
        messages.value.push({
          role: 'ai',
          content: response.reply || response,
          time: formatTime(new Date())
        })
      } catch (error) {
        // 替换加载消息为错误提示
        messages.value.pop()
        messages.value.push({
          role: 'ai',
          content: '抱歉，我暂时无法回答这个问题。请稍后再试或联系人工客服。',
          time: formatTime(new Date())
        })
        console.error('AI response error:', error)
      } finally {
        isTyping.value = false
        await scrollToBottom()
      }
    }

    const selectQuickQuestion = (q) => {
      inputMessage.value = q.question
      sendMessage()
    }

    return {
      chatBox,
      inputMessage,
      isTyping,
      messages,
      quickQuestions,
      sendMessage,
      selectQuickQuestion
    }
  }
}
</script>

<style scoped>
/* 样式继承原有设计，略作调整 */
.typing-indicator {
  font-size: 0.75rem;
  color: var(--color-primary);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.message__time {
  font-size: 0.65rem;
  opacity: 0.7;
  margin-top: 4px;
}

.message--user .message__time {
  text-align: right;
  color: rgba(255, 255, 255, 0.8);
}

.message--ai .message__time {
  color: var(--color-text-muted);
}
</style>