import router from './index'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '../store/user'
import { usePermissionStore } from '../store/permission'
import { ElMessage } from 'element-plus'

// NProgress配置
NProgress.configure({ showSpinner: false })

// 白名单路由（无需权限）
const whiteList = ['/login', '/register', '/forgot-password']

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  // 开启进度条
  NProgress.start()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - iFarm管理系统` : 'iFarm管理系统'
  
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  
  // 判断用户是否已登录
  if (userStore.token) {
    if (to.path === '/login') {
      // 已登录状态下访问登录页，直接跳转到首页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 判断是否已获取用户信息
      if (userStore.roles.length === 0) {
        try {
          // 获取用户信息
          const { roles } = await userStore.getInfo()
          
          // 根据用户角色生成可访问路由
          await permissionStore.generateRoutes(roles)
          
          // 确保动态添加的路由已经完成
          next({ ...to, replace: true })
        } catch (error) {
          // 获取用户信息失败，清空令牌并跳转到登录页
          userStore.resetToken()
          ElMessage.error(error.message || '登录状态异常，请重新登录')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      } else {
        next()
      }
    }
  } else {
    // 未登录状态下
    if (whiteList.includes(to.path)) {
      // 在白名单中，直接访问
      next()
    } else {
      // 非白名单，重定向到登录页
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

// 路由后置守卫
router.afterEach(() => {
  // 关闭进度条
  NProgress.done()
}) 