import { useUserStore } from '../../store/user'

/**
 * 按钮权限指令
 * 使用方式：v-permission="'system:user:create'"
 */
export const permission = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value && typeof value === 'string') {
      // 单个权限检查
      const hasPermission = userStore.hasPermission(value)
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else if (value && Array.isArray(value) && value.length > 0) {
      // 多个权限检查，任一满足即可
      const hasPermission = value.some(permission => {
        return userStore.hasPermission(permission)
      })
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`需要指定权限值`)
    }
  }
}

/**
 * 角色权限指令
 * 使用方式：v-role="['platform_admin', 'rural_admin']"
 */
export const role = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value && Array.isArray(value) && value.length > 0) {
      const hasRole = value.some(role => {
        return userStore.roles.includes(role)
      })
      if (!hasRole) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`需要指定角色值`)
    }
  }
}

/**
 * 用户类型指令
 * 使用方式：v-user-type="[1, 3]" 表示农村管理员和平台管理员可见
 */
export const userType = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value && Array.isArray(value) && value.length > 0) {
      const hasUserType = value.includes(userStore.userType)
      if (!hasUserType) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else if (value && typeof value === 'number') {
      // 单个用户类型
      if (userStore.userType !== value) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`需要指定用户类型值`)
    }
  }
}

export default {
  install(app) {
    // 注册自定义指令
    app.directive('permission', permission)
    app.directive('role', role)
    app.directive('user-type', userType)
  }
} 