import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './styles/index.scss'
import directives from './utils/directive'

// 引入路由权限控制
import './router/permission'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(pinia)
app.use(router)
app.use(directives)
app.mount('#app')
