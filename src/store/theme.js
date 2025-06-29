import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import defaultSettings from '@/settings'
import { useStorage } from '@vueuse/core'

// 预设主题颜色
export const PRESET_COLORS = {
  default: '#409EFF',
  primary: '#409EFF',
  success: '#67C23A',
  warning: '#E6A23C',
  danger: '#F56C6C',
  info: '#909399',
  blue: '#324157',
  red: '#C03639',
  pink: '#E65D6E',
  green: '#30B08F',
  orange: '#FA8C16',
  purple: '#722ED1'
}

// 从本地存储获取设置
const getStoredSettings = () => {
  try {
    const settings = localStorage.getItem('theme-settings')
    return settings ? JSON.parse(settings) : null
  } catch (e) {
    console.error('Error parsing theme settings:', e)
    return null
  }
}

// 保存设置到本地存储
const storeSettings = (settings) => {
  try {
    localStorage.setItem('theme-settings', JSON.stringify(settings))
  } catch (e) {
    console.error('Error storing theme settings:', e)
  }
}

// 生成主题色变体
const generateColorVariants = (primaryColor) => {
  document.documentElement.style.setProperty('--el-color-primary', primaryColor)
}

// 主题状态管理
export const useThemeStore = defineStore('theme', () => {
  // 从本地存储获取初始设置
  const storedSettings = getStoredSettings()
  
  // 侧边栏状态
  const sidebar = ref(useStorage('sidebar', {
    opened: true,
    withoutAnimation: false
  }))
  
  // 设备类型
  const device = ref('desktop')
  
  // 布局设置
  const fixedHeader = ref(defaultSettings.fixedHeader)
  const showSettings = ref(defaultSettings.showSettings)
  const showTagsView = ref(defaultSettings.showTagsView)
  const showSidebarLogo = ref(defaultSettings.showSidebarLogo)
  const showFooter = ref(defaultSettings.showFooter)
  const showBreadcrumb = ref(defaultSettings.enableBreadcrumb)
  
  // 主题设置
  const darkMode = ref(useStorage('darkMode', defaultSettings.darkMode))
  const primaryColor = ref(useStorage('primaryColor', defaultSettings.theme))
  const themeColor = ref(useStorage('themeColor', defaultSettings.theme))
  
  // 侧边栏折叠状态
  const sidebarCollapsed = ref(useStorage('sidebarCollapsed', false))
  
  // 内容区全屏
  const contentFullScreen = ref(useStorage('contentFullScreen', false))
  
  // 标签视图
  const visitedViews = ref([])
  const cachedViews = ref([])
  
  // 加载主题设置
  const loadThemeSettings = () => {
    const storedSettings = getStoredSettings()
    if (storedSettings) {
      // 应用存储的主题色
      if (storedSettings.primaryColor) {
        primaryColor.value = storedSettings.primaryColor
        generateColorVariants(storedSettings.primaryColor)
      }
      
      // 应用暗黑模式
      if (storedSettings.darkMode) {
        document.documentElement.classList.add('dark')
      }
    }
  }
  
  // 切换侧边栏
  const toggleSideBar = () => {
    sidebar.value.opened = !sidebar.value.opened
    sidebar.value.withoutAnimation = false
  }
  
  // 关闭侧边栏
  const closeSideBar = ({ withoutAnimation }) => {
    sidebar.value.opened = false
    sidebar.value.withoutAnimation = withoutAnimation
  }
  
  // 打开侧边栏
  const openSideBar = ({ withoutAnimation }) => {
    sidebar.value.opened = true
    sidebar.value.withoutAnimation = withoutAnimation
  }
  
  // 切换设备类型
  const toggleDevice = (newDevice) => {
    device.value = newDevice
  }
  
  // 切换侧边栏折叠状态
  const toggleSidebarCollapse = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  // 切换暗黑模式
  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    
    // 更新 HTML 根元素的 class
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
      document.body.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.removeAttribute('data-theme')
    }
  }
  
  // 设置主题颜色
  const changePrimaryColor = (color) => {
    if (!color) return
    
    // 检查是否为预设颜色
    if (Object.values(PRESET_COLORS).includes(color)) {
      primaryColor.value = color
      themeColor.value = color
      
      // 生成并应用主题色变体
      generateColorVariants(color)
    }
  }
  
  // 切换固定头部
  const toggleFixedHeader = () => {
    fixedHeader.value = !fixedHeader.value
  }
  
  // 切换标签视图
  const toggleTagsView = () => {
    showTagsView.value = !showTagsView.value
  }
  
  // 切换侧边栏 Logo
  const toggleSidebarLogo = () => {
    showSidebarLogo.value = !showSidebarLogo.value
  }
  
  // 切换面包屑显示
  const toggleBreadcrumb = () => {
    showBreadcrumb.value = !showBreadcrumb.value
  }
  
  // 切换页脚
  const toggleFooter = () => {
    showFooter.value = !showFooter.value
  }
  
  // 切换内容区全屏
  const toggleContentFullScreen = () => {
    contentFullScreen.value = !contentFullScreen.value
  }
  
  // 重置设置
  const resetSettings = () => {
    primaryColor.value = PRESET_COLORS.default
    themeColor.value = PRESET_COLORS.default
    darkMode.value = false
    sidebarCollapsed.value = false
    showTagsView.value = true
    fixedHeader.value = true
    showBreadcrumb.value = true
    showSidebarLogo.value = true
    showFooter.value = true
    contentFullScreen.value = false
    
    // 更新CSS变量
    generateColorVariants(PRESET_COLORS.default)
    document.documentElement.classList.remove('dark')
    document.body.removeAttribute('data-theme')
  }
  
  // 添加访问视图
  const addVisitedView = (view) => {
    if (visitedViews.value.some(v => v.path === view.path)) return
    
    visitedViews.value.push(
      Object.assign({}, view, {
        title: view.meta.title || 'no-name'
      })
    )
  }
  
  // 添加缓存视图
  const addCachedView = (view) => {
    if (cachedViews.value.includes(view.name)) return
    if (!view.meta.noCache) {
      cachedViews.value.push(view.name)
    }
  }
  
  // 删除访问视图
  const delVisitedView = (view) => {
    const index = visitedViews.value.findIndex(v => v.path === view.path)
    if (index !== -1) {
      visitedViews.value.splice(index, 1)
    }
  }
  
  // 删除缓存视图
  const delCachedView = (view) => {
    const index = cachedViews.value.indexOf(view.name)
    if (index !== -1) {
      cachedViews.value.splice(index, 1)
    }
  }
  
  // 删除其他视图
  const delOthersViews = (view) => {
    visitedViews.value = visitedViews.value.filter(v => {
      return v.meta.affix || v.path === view.path
    })
    
    const index = cachedViews.value.indexOf(view.name)
    if (index > -1) {
      cachedViews.value = cachedViews.value.slice(index, index + 1)
    } else {
      cachedViews.value = []
    }
  }
  
  // 删除所有视图
  const delAllViews = () => {
    // 保留固定标签
    visitedViews.value = visitedViews.value.filter(tag => tag.meta.affix)
    cachedViews.value = []
  }

  return {
    sidebar,
    device,
    fixedHeader,
    showSettings,
    showTagsView,
    showSidebarLogo,
    showFooter,
    showBreadcrumb,
    darkMode,
    primaryColor,
    themeColor,
    sidebarCollapsed,
    contentFullScreen,
    visitedViews,
    cachedViews,
    loadThemeSettings,
    toggleSideBar,
    closeSideBar,
    openSideBar,
    toggleDevice,
    toggleSidebarCollapse,
    toggleDarkMode,
    changePrimaryColor,
    toggleFixedHeader,
    toggleTagsView,
    toggleSidebarLogo,
    toggleBreadcrumb,
    toggleFooter,
    toggleContentFullScreen,
    resetSettings,
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delOthersViews,
    delAllViews
  }
}) 