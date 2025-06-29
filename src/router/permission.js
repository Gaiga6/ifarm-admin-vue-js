import router from './index'
import { useUserStore } from '@/store/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// NProgress 配置
NProgress.configure({ showSpinner: false })

// 白名单路由
const whiteList = ['/login', '/auth-redirect']

// 调试日志函数
const logDebug = (message, data) => {
  console.log(`%c[路由调试] ${message}`, 'color: #409EFF; font-weight: bold;', data || '')
}

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start()

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - iFarm Admin` : 'iFarm Admin'
  
  logDebug(`路由跳转: ${from.path} -> ${to.path}`, { to, from })

  const userStore = useUserStore()
  
  logDebug('当前Token:', userStore.token)
  logDebug('当前用户角色:', userStore.roles)

  // 判断用户是否已登录
  if (userStore.token) {
    logDebug('用户已登录')
    if (to.path === '/login') {
      // 如果已登录，跳转到首页
      logDebug('已登录状态访问登录页，重定向到首页')
      next({ path: '/' })
      NProgress.done()
    } else {
      // 检查用户是否已获取权限
      if (userStore.roles.length === 0) {
        logDebug('用户角色为空，开始获取用户信息')
        try {
          // 获取用户信息
          const userInfo = await userStore.getUserInfo()
          logDebug('获取用户信息成功', userInfo)
          
          // 直接访问目标页面，不处理动态路由
          next({ ...to, replace: true })
        } catch (error) {
          // 重置令牌并跳转到登录页
          logDebug('获取用户信息失败', error)
          await userStore.resetToken()
          console.error(error)
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      } else {
        logDebug('用户角色已存在，直接访问', to.path)
        next()
      }
    }
  } else {
    // 未登录
    logDebug('用户未登录')
    if (whiteList.indexOf(to.path) !== -1) {
      // 白名单中的路由直接放行
      logDebug('访问白名单路由，直接放行', to.path)
      next()
    } else {
      // 其他页面重定向到登录页
      logDebug('访问受限路由，重定向到登录页', to.path)
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach((to) => {
  // 结束进度条
  NProgress.done()
  logDebug('路由加载完成', to.path)
}) 