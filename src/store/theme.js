import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 预设主题颜色
const PRESET_COLORS = {
  default: '#409eff',
  green: '#67c23a',
  orange: '#e6a23c',
  red: '#f56c6c',
  purple: '#909399'
}

// 获取本地存储的主题设置
const getStoredSettings = () => {
  try {
    const settings = localStorage.getItem('theme-settings')
    return settings ? JSON.parse(settings) : null
  } catch (error) {
    console.error('获取主题设置失败:', error)
    return null
  }
}

// 存储主题设置到本地
const storeSettings = (settings) => {
  try {
    localStorage.setItem('theme-settings', JSON.stringify(settings))
  } catch (error) {
    console.error('存储主题设置失败:', error)
  }
}

// 主题状态管理
export const useThemeStore = defineStore('theme', () => {
  // 从本地存储获取初始设置
  const storedSettings = getStoredSettings()
  
  // 状态
  const primaryColor = ref(storedSettings?.primaryColor || PRESET_COLORS.default)
  const darkMode = ref(storedSettings?.darkMode || false)
  const sidebarCollapsed = ref(storedSettings?.sidebarCollapsed || false)
  const showTagsView = ref(storedSettings?.showTagsView !== false) // 默认显示
  const fixedHeader = ref(storedSettings?.fixedHeader !== false) // 默认固定
  const showBreadcrumb = ref(storedSettings?.showBreadcrumb !== false) // 默认显示
  const showLogo = ref(storedSettings?.showLogo !== false) // 默认显示
  const showFooter = ref(storedSettings?.showFooter !== false) // 默认显示
  const contentFullScreen = ref(storedSettings?.contentFullScreen || false)
  
  // 标签页导航
  const visitedViews = ref(storedSettings?.visitedViews || [])
  const cachedViews = ref([]) // 不需要持久化缓存
  
  // 监听变化，保存到本地存储
  watch(
    [
      primaryColor, 
      darkMode, 
      sidebarCollapsed, 
      showTagsView, 
      fixedHeader, 
      showBreadcrumb,
      showLogo,
      showFooter,
      contentFullScreen,
      visitedViews
    ],
    () => {
      storeSettings({
        primaryColor: primaryColor.value,
        darkMode: darkMode.value,
        sidebarCollapsed: sidebarCollapsed.value,
        showTagsView: showTagsView.value,
        fixedHeader: fixedHeader.value,
        showBreadcrumb: showBreadcrumb.value,
        showLogo: showLogo.value,
        showFooter: showFooter.value,
        contentFullScreen: contentFullScreen.value,
        visitedViews: visitedViews.value
      })
    },
    { deep: true }
  )
  
  // 切换主题颜色
  const changePrimaryColor = (color) => {
    if (!color) return
    
    // 检查是否为预设颜色
    if (Object.values(PRESET_COLORS).includes(color)) {
      primaryColor.value = color
      
      // 更新CSS变量
      document.documentElement.style.setProperty('--el-color-primary', color)
      
      // 生成其他级别的颜色
      for (let i = 1; i <= 9; i++) {
        const mix = i * 10
        const colorMix = mix === 20 
          ? 'rgba(64, 158, 255, 0.8)'
          : mix === 10
            ? 'rgba(64, 158, 255, 0.9)'
            : `rgba(64, 158, 255, ${1 - mix / 100})`
        document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, colorMix)
      }
      
      // 设置暗色
      document.documentElement.style.setProperty('--el-color-primary-dark-2', '#337ecc')
    }
  }
  
  // 切换暗黑模式
  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
      document.body.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.removeAttribute('data-theme')
    }
  }

  // 切换侧边栏折叠状态
  const toggleSidebarCollapse = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // 切换标签页显示
  const toggleTagsView = () => {
    showTagsView.value = !showTagsView.value
  }

  // 切换固定头部
  const toggleFixedHeader = () => {
    fixedHeader.value = !fixedHeader.value
  }

  // 切换面包屑显示
  const toggleBreadcrumb = () => {
    showBreadcrumb.value = !showBreadcrumb.value
  }

  // 切换Logo显示
  const toggleLogo = () => {
    showLogo.value = !showLogo.value
  }

  // 切换页脚显示
  const toggleFooter = () => {
    showFooter.value = !showFooter.value
  }

  // 切换内容区全屏
  const toggleContentFullScreen = () => {
    contentFullScreen.value = !contentFullScreen.value
  }

  // 添加访问过的视图
  const addVisitedView = (view) => {
    if (!view?.path) return
    
    const index = visitedViews.value.findIndex(v => v.path === view.path)
    if (index === -1) {
      // 限制最大数量
      if (visitedViews.value.length >= 20) {
        visitedViews.value.shift()
      }
      visitedViews.value.push({
        path: view.path,
        title: view.meta?.title || 'Unknown',
        name: view.name
      })
    }
  }

  // 添加缓存视图
  const addCachedView = (view) => {
    if (!view?.name || cachedViews.value.includes(view.name)) return
    if (view.meta?.keepAlive) {
      cachedViews.value.push(view.name)
    }
  }

  // 删除访问过的视图
  const delVisitedView = (view) => {
    const index = visitedViews.value.findIndex(v => v.path === view.path)
    if (index > -1) {
      visitedViews.value.splice(index, 1)
    }
  }

  // 删除缓存视图
  const delCachedView = (view) => {
    const index = cachedViews.value.indexOf(view.name)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  // 删除其他视图
  const delOthersViews = (view) => {
    visitedViews.value = visitedViews.value.filter(v => v.path === view.path)
    cachedViews.value = cachedViews.value.filter(name => name === view.name)
  }

  // 删除所有视图
  const delAllViews = () => {
    visitedViews.value = []
    cachedViews.value = []
  }

  // 重置设置
  const resetSettings = () => {
    primaryColor.value = PRESET_COLORS.default
    darkMode.value = false
    sidebarCollapsed.value = false
    showTagsView.value = true
    fixedHeader.value = true
    showBreadcrumb.value = true
    showLogo.value = true
    showFooter.value = true
    contentFullScreen.value = false
    
    // 更新CSS变量
    document.documentElement.style.setProperty('--el-color-primary', PRESET_COLORS.default)
    document.documentElement.classList.remove('dark')
    document.body.removeAttribute('data-theme')
    
    ElMessage.success('重置设置成功')
  }

  // 初始化
  if (storedSettings) {
    // 应用存储的主题色
    if (storedSettings.primaryColor) {
      changePrimaryColor(storedSettings.primaryColor)
    }
    
    // 应用暗黑模式
    if (storedSettings.darkMode) {
      document.documentElement.classList.add('dark')
      document.body.setAttribute('data-theme', 'dark')
    }
  }

  return {
    // 状态
    primaryColor,
    darkMode,
    sidebarCollapsed,
    showTagsView,
    fixedHeader,
    showBreadcrumb,
    showLogo,
    showFooter,
    contentFullScreen,
    visitedViews,
    cachedViews,
    PRESET_COLORS,
    
    // 方法
    changePrimaryColor,
    toggleDarkMode,
    toggleSidebarCollapse,
    toggleTagsView,
    toggleFixedHeader,
    toggleBreadcrumb,
    toggleLogo,
    toggleFooter,
    toggleContentFullScreen,
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delOthersViews,
    delAllViews,
    resetSettings
  }
}) 