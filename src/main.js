import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './router/permission'
import './styles/index.scss'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './styles/index.scss'
import directives from './utils/directive'

// 调试日志函数
const logDebug = (message, data) => {
  console.log(`%c[应用初始化] ${message}`, 'color: #409EFF; font-weight: bold; font-size: 14px;', data || '')
}

// 记录应用启动时间
const startTime = performance.now()
logDebug('应用开始初始化')

// 创建应用实例
const app = createApp(App)
logDebug('Vue应用实例创建完成')

// 性能优化配置
app.config.performance = process.env.NODE_ENV !== 'production'

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err)
  console.info('Error Info:', info)
}

// 警告处理
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue Warning:', msg)
  console.info('Trace:', trace)
}

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
logDebug('Element Plus图标注册完成')

// 全局属性
app.config.globalProperties.$env = process.env.NODE_ENV

// 使用插件
app.use(ElementPlus, {
  size: 'default', // 设置组件默认尺寸
  zIndex: 3000 // 设置弹框层级
})

// 注册Pinia状态管理
const pinia = createPinia()
app.use(pinia)
logDebug('Pinia状态管理注册完成')

// 注册路由
app.use(router)
logDebug('Vue Router注册完成')

app.use(directives)

// 挂载应用
app.mount('#app')
const endTime = performance.now()
logDebug(`应用挂载完成，耗时: ${(endTime - startTime).toFixed(2)}ms`)

// 开发环境下的全局错误处理
if (import.meta.env.DEV) {
  app.config.errorHandler = (err, vm, info) => {
    console.error(`%c[全局错误] ${err}`, 'color: #F56C6C; font-weight: bold;')
    console.error('错误组件:', vm)
    console.error('错误信息:', info)
    console.error('错误堆栈:', err.stack)
  }
  
  logDebug('开发环境全局错误处理器已设置')
  
  // 输出环境信息
  logDebug('环境信息', {
    mode: import.meta.env.MODE,
    baseUrl: import.meta.env.BASE_URL,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  })
}

// 导出app实例（可用于其他地方引用）
export default app
