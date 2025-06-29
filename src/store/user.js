import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePermissionStore } from './permission'
import router from '../router'
import request from '../utils/request'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const name = ref('')
  const avatar = ref('')
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
        roles: ['admin'],
        permissions: ['system:user:list', 'system:user:create', 'system:user:edit', 'system:user:delete']
      }
      
      const { name: userName, avatar: userAvatar, roles: userRoles, permissions: userPermissions } = data
      
      // 验证返回的roles是否是一个非空数组
      if (!userRoles || userRoles.length <= 0) {
        throw new Error('用户角色必须是一个非空数组!')
      }
      
      name.value = userName
      avatar.value = userAvatar
      roles.value = userRoles
      permissions.value = userPermissions
      
      return data
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
    roles.value = []
    permissions.value = []
  }

  // 检查是否有指定权限
  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }

  return {
    token,
    name,
    avatar,
    roles,
    permissions,
    getInfo,
    login,
    logout,
    resetToken,
    resetInfo,
    hasPermission
  }
}) 