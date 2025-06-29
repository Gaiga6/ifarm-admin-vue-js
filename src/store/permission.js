import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '../router'

// 定义一个动态路由表（实际项目中可能来自后端）
const asyncRoutes = [
  {
    path: '/system',
    name: 'System',
    component: () => import('../layout/index.vue'),
    meta: {
      title: '系统管理',
      icon: 'Setting',
      roles: ['platform_admin']  // 只有平台管理员可访问
    },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/system/user.vue'),
        meta: {
          title: '用户管理',
          icon: 'User',
          roles: ['platform_admin']
        }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('../views/system/role.vue'),
        meta: {
          title: '角色管理',
          icon: 'Lock',
          roles: ['platform_admin']
        }
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('../views/system/menu.vue'),
        meta: {
          title: '菜单管理',
          icon: 'Menu',
          roles: ['platform_admin']
        }
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../layout/index.vue'),
    meta: {
      title: '个人中心',
      icon: 'UserFilled',
      roles: ['platform_admin', 'rural_admin', 'user'] // 所有用户可访问
    },
    children: [
      {
        path: 'index',
        name: 'ProfileIndex',
        component: () => import('../views/profile/index.vue'),
        meta: {
          title: '个人信息',
          icon: 'User',
          roles: ['platform_admin', 'rural_admin', 'user']
        }
      }
    ]
  }
]

// 权限状态管理
export const usePermissionStore = defineStore('permission', () => {
  // 状态
  const routes = ref([])
  const dynamicRoutes = ref([])
  
  // 用户权限过滤
  const hasPermission = (route, roles) => {
    if (route.meta && route.meta.roles) {
      return roles.some(role => route.meta.roles.includes(role))
    } else {
      return true
    }
  }

  // 过滤路由
  const filterAsyncRoutes = (routes, roles) => {
    const res = []
    
    routes.forEach(route => {
      const tmp = { ...route }
      if (hasPermission(tmp, roles)) {
        if (tmp.children) {
          tmp.children = filterAsyncRoutes(tmp.children, roles)
        }
        res.push(tmp)
      }
    })
    
    return res
  }

  // 生成可访问路由
  const generateRoutes = async (roles) => {
    try {
      let accessedRoutes
      if (roles.includes('platform_admin')) {
        // 平台管理员可访问所有路由
        accessedRoutes = asyncRoutes || []
      } else {
        // 根据角色过滤路由
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      
      dynamicRoutes.value = accessedRoutes
      routes.value = [...dynamicRoutes.value]
      
      // 动态添加路由
      accessedRoutes.forEach(route => {
        router.addRoute(route)
      })
      
      return accessedRoutes
    } catch (error) {
      console.error('生成路由失败:', error)
      return []
    }
  }

  // 重置路由
  const resetRoutes = () => {
    dynamicRoutes.value.forEach(route => {
      if (router.hasRoute(route.name)) {
        router.removeRoute(route.name)
      }
    })
    routes.value = []
    dynamicRoutes.value = []
  }

  return {
    routes,
    dynamicRoutes,
    generateRoutes,
    resetRoutes
  }
}) 