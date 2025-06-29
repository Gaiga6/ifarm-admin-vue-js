import { createRouter, createWebHashHistory } from 'vue-router'

// 调试日志函数
const logDebug = (message, data) => {
  console.log(`%c[路由配置] ${message}`, 'color: #67C23A; font-weight: bold;', data || '')
}

// 基础路由
const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/redirect',
    component: () => import('@/layout/index.vue'),
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue'),
    hidden: true
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        name: 'Dashboard',
        meta: { title: '仪表盘', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/system',
    component: () => import('@/layout/index.vue'),
    redirect: '/system/user',
    name: 'System',
    meta: { title: '系统管理', icon: 'setting' },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user.vue'),
        name: 'User',
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role.vue'),
        name: 'Role',
        meta: { title: '角色管理', icon: 'peoples' }
      },
      {
        path: 'menu',
        component: () => import('@/views/system/menu.vue'),
        name: 'Menu',
        meta: { title: '菜单管理', icon: 'tree' }
      }
    ]
  },
  {
    path: '/profile',
    component: () => import('@/layout/index.vue'),
    name: 'Profile',
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index.vue'),
        name: 'ProfileIndex',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  // 404 页面必须放在最后
  { path: '/:pathMatch(.*)*', redirect: '/404', hidden: true }
]

// 打印路由配置
logDebug('路由配置初始化', constantRoutes)

// 创建路由
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
})

logDebug('路由实例创建完成')

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