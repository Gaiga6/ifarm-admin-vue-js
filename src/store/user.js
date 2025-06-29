import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePermissionStore } from './permission'
import router from '../router'
import request from '../utils/request'

// 用户类型映射为角色名称
const USER_TYPE_ROLES = {
  0: 'user',         // 普通用户
  1: 'rural_admin',  // 农村管理员
  3: 'platform_admin' // 平台管理员
}

// 预设每种用户类型的权限
const USER_TYPE_PERMISSIONS = {
  0: ['profile:view'], // 普通用户权限
  1: [                 // 农村管理员权限
    'profile:view',
    'profile:edit',
    'system:view'
  ],
  3: [                 // 平台管理员权限
    'profile:view',
    'profile:edit',
    'system:view',
    'system:user:list',
    'system:user:create', 
    'system:user:edit', 
    'system:user:delete',
    'system:role:list',
    'system:menu:list'
  ]
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const name = ref('')
  const avatar = ref('')
  const userType = ref(0) // 用户类型：0普通用户，1农村管理员，3平台管理员
  const roles = ref([])
  const permissions = ref([])

  // 获取用户信息
  const getInfo = async () => {
    try {
      // 实际项目中，这里应该调用API获取用户信息
      // const { data } = await request.get('/user/info')
      
      // 模拟API返回
      const data = {
        name: '管理员',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        userType: 3 // 平台管理员
      }
      
      const { name: userName, avatar: userAvatar, userType: type } = data
      
      // 设置用户基本信息
      name.value = userName
      avatar.value = userAvatar
      userType.value = type
      
      // 根据用户类型映射角色
      const userRoles = [USER_TYPE_ROLES[type] || 'user']
      roles.value = userRoles
      
      // 根据用户类型获取预设权限
      permissions.value = USER_TYPE_PERMISSIONS[type] || []
      
      return { ...data, roles: userRoles, permissions: permissions.value }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return Promise.reject(error)
    }
  }

  // 登录
  const login = async (userInfo) => {
    try {
      const { username, password } = userInfo
      
      // 实际项目中，这里应该调用API进行登录
      // const { data } = await request.post('/auth/login', { username, password })
      
      // 模拟API返回
      const data = { token: 'admin-token' }
      
      token.value = data.token
      localStorage.setItem('token', data.token)
      
      return data
    } catch (error) {
      console.error('登录失败:', error)
      return Promise.reject(error)
    }
  }

  // 登出
  const logout = async () => {
    try {
      // 实际项目中，这里应该调用API进行登出
      // await request.post('/auth/logout')
      
      resetToken()
      resetInfo()
      
      // 重置动态路由
      const permissionStore = usePermissionStore()
      permissionStore.resetRoutes()
      
      // 跳转到登录页
      router.push('/login')
      
      return Promise.resolve()
    } catch (error) {
      console.error('登出失败:', error)
      return Promise.reject(error)
    }
  }

  // 重置Token
  const resetToken = () => {
    token.value = ''
    localStorage.removeItem('token')
  }

  // 重置用户信息
  const resetInfo = () => {
    name.value = ''
    avatar.value = ''
    userType.value = 0
    roles.value = []
    permissions.value = []
  }

  // 检查是否有指定权限
  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }

  // 获取用户类型名称
  const getUserTypeName = () => {
    const typeNames = {
      0: '普通用户',
      1: '农村管理员',
      3: '平台管理员'
    }
    return typeNames[userType.value] || '未知类型'
  }

  return {
    token,
    name,
    avatar,
    userType,
    roles,
    permissions,
    getInfo,
    login,
    logout,
    resetToken,
    resetInfo,
    hasPermission,
    getUserTypeName
  }
}) 