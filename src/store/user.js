import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePermissionStore } from './permission'
import router from '../router'
import request from '../utils/request'

// 调试日志函数
const logDebug = (message, data) => {
  console.log(`%c[用户调试] ${message}`, 'color: #E6A23C; font-weight: bold;', data || '')
}

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

// 用户类型标签类型
const USER_TYPE_TAG = {
  0: 'info',
  1: 'success',
  3: 'danger'
}

// 用户类型标签文本
const USER_TYPE_LABEL = {
  0: '普通用户',
  1: '农村管理员',
  3: '平台管理员'
}

// 模拟用户数据
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    name: '超级管理员',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    email: 'admin@example.com',
    phone: '13800138000',
    userType: 3,
    status: 1,
    createdTime: '2023-01-01'
  },
  {
    id: 2,
    username: 'rural',
    password: '123456',
    name: '农村管理员',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    email: 'rural@example.com',
    phone: '13800138001',
    userType: 1,
    status: 1,
    createdTime: '2023-01-02'
  },
  {
    id: 3,
    username: 'user',
    password: '123456',
    name: '张三',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    email: 'user@example.com',
    phone: '13800138002',
    userType: 0,
    status: 1,
    createdTime: '2023-01-03'
  }
]

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const id = ref(0)
  const username = ref('')
  const name = ref('用户')
  const avatar = ref('')
  const email = ref('')
  const phone = ref('')
  const userType = ref(0) // 用户类型：0普通用户，1农村管理员，3平台管理员
  const status = ref(1)
  const roles = ref([])
  const permissions = ref([])
  
  logDebug('用户Store初始化', { token: token.value, roles: roles.value })

  // 获取用户信息
  const getInfo = async () => {
    logDebug('开始获取用户信息')
    try {
      // 实际项目中，这里应该调用API获取用户信息
      // const { data } = await request.get('/user/info')
      
      // 模拟API返回 - 根据token选择用户
      let userData = MOCK_USERS[0]; // 默认超级管理员
      
      if (token.value.includes('rural')) {
        userData = MOCK_USERS[1];
      } else if (token.value.includes('user')) {
        userData = MOCK_USERS[2];
      }
      
      logDebug('获取到用户数据', userData)
      
      // 设置用户基本信息
      id.value = userData.id
      username.value = userData.username
      name.value = userData.name
      avatar.value = userData.avatar
      email.value = userData.email
      phone.value = userData.phone
      userType.value = userData.userType
      status.value = userData.status
      
      // 根据用户类型映射角色
      const userRoles = [USER_TYPE_ROLES[userData.userType] || 'user']
      roles.value = userRoles
      
      // 根据用户类型获取预设权限
      permissions.value = USER_TYPE_PERMISSIONS[userData.userType] || []
      
      logDebug('用户信息设置完成', { 
        id: id.value,
        username: username.value,
        name: name.value,
        roles: roles.value,
        permissions: permissions.value
      })
      
      return { ...userData, roles: userRoles, permissions: permissions.value }
    } catch (error) {
      logDebug('获取用户信息失败', error)
      console.error('获取用户信息失败:', error)
      return Promise.reject(error)
    }
  }
  
  // getUserInfo 方法 (兼容性方法，与 permission.js 中的调用保持一致)
  const getUserInfo = async () => {
    logDebug('调用getUserInfo方法')
    return await getInfo()
  }

  // 登录
  const login = async (userInfo) => {
    logDebug('开始登录', { username: userInfo.username })
    try {
      const { username: loginUsername, password } = userInfo
      
      // 实际项目中，这里应该调用API进行登录
      // const { data } = await request.post('/auth/login', { username, password })
      
      // 模拟API返回 - 根据用户名选择不同token
      let tokenValue = 'admin-token';
      
      if (loginUsername === 'rural') {
        tokenValue = 'rural-token';
      } else if (loginUsername === 'user') {
        tokenValue = 'user-token';
      }
      
      logDebug('登录成功，设置token', tokenValue)
      token.value = tokenValue
      localStorage.setItem('token', tokenValue)
      
      return { token: tokenValue }
    } catch (error) {
      logDebug('登录失败', error)
      console.error('登录失败:', error)
      return Promise.reject(error)
    }
  }

  // 登出
  const logout = async () => {
    logDebug('开始登出')
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
      
      logDebug('登出完成')
      return Promise.resolve()
    } catch (error) {
      logDebug('登出失败', error)
      console.error('登出失败:', error)
      return Promise.reject(error)
    }
  }

  // 重置Token
  const resetToken = () => {
    logDebug('重置Token')
    token.value = ''
    localStorage.removeItem('token')
  }

  // 重置用户信息
  const resetInfo = () => {
    logDebug('重置用户信息')
    id.value = 0
    username.value = ''
    name.value = '用户'
    avatar.value = ''
    email.value = ''
    phone.value = ''
    userType.value = 0
    status.value = 1
    roles.value = []
    permissions.value = []
  }

  // 检查是否有指定权限
  const hasPermission = (permission) => {
    const has = permissions.value.includes(permission)
    logDebug(`检查权限 [${permission}]: ${has ? '有权限' : '无权限'}`)
    return has
  }

  // 获取用户类型名称
  const getUserTypeName = () => {
    const typeName = USER_TYPE_LABEL[userType.value] || '未知类型'
    logDebug('获取用户类型名称', typeName)
    return typeName
  }
  
  // 获取用户类型标签类型
  const getUserTypeTag = () => {
    const typeTag = USER_TYPE_TAG[userType.value] || 'info'
    logDebug('获取用户类型标签', typeTag)
    return typeTag
  }

  return {
    token,
    id,
    username,
    name,
    avatar,
    email,
    phone,
    userType,
    status,
    roles,
    permissions,
    getInfo,
    getUserInfo,
    login,
    logout,
    resetToken,
    resetInfo,
    hasPermission,
    getUserTypeName,
    getUserTypeTag
  }
}) 