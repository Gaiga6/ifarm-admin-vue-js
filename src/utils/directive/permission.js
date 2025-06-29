import { useUserStore } from '../../store/user'

/**
 * 按钮权限指令
 * 使用方式：v-permission="'system:user:create'"
 */
export const permission = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value && value instanceof String) {
      // 单个权限检查
      const hasPermission = userStore.hasPermission(value)
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else if (value && value instanceof Array && value.length > 0) {
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
 * 使用方式：v-role="['admin', 'editor']"
 */
export const role = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value && value instanceof Array && value.length > 0) {
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

export default {
  install(app) {
    // 注册自定义指令
    app.directive('permission', permission)
    app.directive('role', role)
  }
} 