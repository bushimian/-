import { createRouter, createWebHistory } from 'vue-router'
import { authAPI } from '@/api/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/service',
    name: 'Service',
    component: () => import('@/views/ServicePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫 - 权限验证
router.beforeEach((to, from, next) => {
  const isAuthenticated = authAPI.isAuthenticated()
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 未登录，跳转首页并提示
    next({
      path: '/',
      query: { redirect: to.fullPath, login: 'required' }
    })
  } else if (to.path === '/' && isAuthenticated && to.query.login !== 'required') {
    // 已登录，访问首页自动跳转服务页
    next('/service')
  } else {
    next()
  }
})

export default router