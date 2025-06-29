import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '../router'

// 调试日志函数
const logDebug = (message, data) => {
  console.log(`%c[权限调试] ${message}`, 'color: #67C23A; font-weight: bold;', data || '')
}

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
  
  logDebug('权限Store初始化')
  
  // 用户权限过滤
  const hasPermission = (route, roles) => {
    if (route.meta && route.meta.roles) {
      const hasRole = roles.some(role => route.meta.roles.includes(role))
      logDebug(`检查路由权限 [${route.path}]: ${hasRole ? '有权限' : '无权限'}`, { 
        routeRoles: route.meta.roles, 
        userRoles: roles 
      })
      return hasRole
    } else {
      logDebug(`路由 [${route.path}] 无需权限检查`)
      return true
    }
  }

  // 过滤路由
  const filterAsyncRoutes = (routes, roles) => {
    logDebug('开始过滤路由', { routes, roles })
    const res = []
    
    routes.forEach(route => {
      const tmp = { ...route }
      if (hasPermission(tmp, roles)) {
        if (tmp.children) {
          logDebug(`处理子路由 [${tmp.path}]`, tmp.children)
          tmp.children = filterAsyncRoutes(tmp.children, roles)
        }
        res.push(tmp)
        logDebug(`添加路由 [${tmp.path}]`)
      } else {
        logDebug(`过滤掉无权限路由 [${tmp.path}]`)
      }
    })
    
    logDebug('路由过滤完成', res)
    return res
  }

  // 生成可访问路由
  const generateRoutes = async (roles) => {
    try {
      logDebug('开始生成路由', roles)
      let accessedRoutes
      if (roles.includes('platform_admin')) {
        // 平台管理员可访问所有路由
        logDebug('平台管理员角色，获取所有路由')
        accessedRoutes = asyncRoutes || []
      } else {
        // 根据角色过滤路由
        logDebug('非管理员角色，过滤路由')
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      
      dynamicRoutes.value = accessedRoutes
      routes.value = [...dynamicRoutes.value]
      
      logDebug('动态路由生成完成', dynamicRoutes.value)
      
      // 动态添加路由
      accessedRoutes.forEach(route => {
        router.addRoute(route)
        logDebug('添加路由到Router', route)
      })
      
      return accessedRoutes
    } catch (error) {
      logDebug('生成路由失败', error)
      console.error('生成路由失败:', error)
      return []
    }
  }

  // 重置路由
  const resetRoutes = () => {
    logDebug('重置路由')
    dynamicRoutes.value.forEach(route => {
      if (router.hasRoute(route.name)) {
        router.removeRoute(route.name)
        logDebug(`移除路由 [${route.name}]`)
      }
    })
    routes.value = []
    dynamicRoutes.value = []
    logDebug('路由重置完成')
  }

  return {
    routes,
    dynamicRoutes,
    generateRoutes,
    resetRoutes
  }
}) 