<template>
  <div class="container container--service">
    <div class="service-header">
      <div>
        <h2 class="service-header__title">📚 智慧学生服务中心</h2>
        <p id="welcomeTip">👋 欢迎 {{ authStore.userName }} · AI赋能校园服务</p>
      </div>
      <div class="service-header__actions">
        <button @click="refreshData" class="btn btn--secondary" :disabled="loading">
          🔄 刷新数据
        </button>
        <button @click="handleLogout" class="btn btn--secondary">
          🚪 退出登录
        </button>
      </div>
    </div>

    <div v-if="error" class="error-banner">
      {{ error }}
      <button @click="refreshData">重试</button>
    </div>

    <div class="dashboard">
      <ScheduleTable :schedule="schedule" :loading="loading" />
      <ScoreTable :scores="scores" :loading="loading" />
      <ActivityList :activities="activities" :loading="loading" />
      <StudentInfo :user="authStore.user" />
      <AIAssistant />
    </div>

    <footer class="footer">
      东华理工大学 · 智慧校园 | AI助手整合校园知识库 | 联系我们: info@ecut.edu.cn
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCampusStore } from '@/stores/campus'
import ScheduleTable from '@/components/ScheduleTable.vue'
import ScoreTable from '@/components/ScoreTable.vue'
import ActivityList from '@/components/ActivityList.vue'
import StudentInfo from '@/components/StudentInfo.vue'
import AIAssistant from '@/components/AIAssistant.vue'

const router = useRouter()
const authStore = useAuthStore()
const campusStore = useCampusStore()

const schedule = ref([])
const scores = ref([])
const activities = ref([])
const loading = ref(false)
const error = ref(null)

const fetchAllData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 并行请求所有数据
    const [scheduleData, scoreData, activityData] = await Promise.all([
      campusStore.fetchSchedule(),
      campusStore.fetchScores(),
      campusStore.fetchActivities()
    ])
    
    schedule.value = scheduleData
    scores.value = scoreData
    activities.value = activityData
  } catch (err) {
    error.value = '数据加载失败，请检查网络连接后重试'
    console.error('Data fetch error:', err)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchAllData()
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(() => {
  fetchAllData()
})
</script>