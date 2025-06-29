import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/redirect',
    component: () => import('../layout/index.vue'),
    meta: { requiresAuth: true },
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('../views/redirect/index.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    meta: { 
      requiresAuth: true 
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'Monitor',
          keepAlive: true
        }
      }
    ]
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/404.vue'),
    meta: {
      title: '404',
      requiresAuth: false
    },
    hidden: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - iFarm管理系统` : 'iFarm管理系统'
  
  // TODO: 根据用户登录状态判断权限
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router 