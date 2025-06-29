import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useThemeStore } from './theme'

// 获取本地存储的设置
const getStoredSettings = () => {
  try {
    const settings = localStorage.getItem('app-settings')
    return settings ? JSON.parse(settings) : null
  } catch (error) {
    console.error('获取设置失败:', error)
    return null
  }
}

// 存储设置到本地
const storeSettings = (settings) => {
  try {
    localStorage.setItem('app-settings', JSON.stringify(settings))
  } catch (error) {
    console.error('存储设置失败:', error)
  }
}

// 设置状态管理
export const useSettingsStore = defineStore('settings', () => {
  const themeStore = useThemeStore()
  const storedSettings = getStoredSettings()
  
  // 页面过渡动画
  const pageTransition = ref(storedSettings?.pageTransition || 'fade-transform')
  
  // 是否使用标签栏
  const useTagsView = computed({
    get: () => themeStore.showTagsView,
    set: (val) => themeStore.toggleTagsView()
  })
  
  // 是否固定头部
  const fixedHeader = computed({
    get: () => themeStore.fixedHeader,
    set: (val) => themeStore.toggleFixedHeader()
  })
  
  // 是否显示侧边栏Logo
  const showSidebarLogo = computed({
    get: () => themeStore.showSidebarLogo,
    set: (val) => themeStore.toggleSidebarLogo()
  })
  
  // 是否显示面包屑
  const showBreadcrumb = computed({
    get: () => themeStore.showBreadcrumb,
    set: (val) => themeStore.toggleBreadcrumb()
  })
  
  // 是否显示页脚
  const showFooter = computed({
    get: () => themeStore.showFooter,
    set: (val) => themeStore.toggleFooter()
  })
  
  // 是否使用全屏内容
  const contentFullScreen = computed({
    get: () => themeStore.contentFullScreen,
    set: (val) => themeStore.toggleContentFullScreen()
  })
  
  // 监听设置变化，保存到本地
  watch(
    [pageTransition],
    () => {
      storeSettings({
        pageTransition: pageTransition.value
      })
    },
    { deep: true }
  )
  
  // 设置页面过渡动画
  const setPageTransition = (transition) => {
    pageTransition.value = transition
  }
  
  // 重置所有设置
  const resetSettings = () => {
    pageTransition.value = 'fade-transform'
    themeStore.resetSettings()
  }
  
  return {
    pageTransition,
    useTagsView,
    fixedHeader,
    showSidebarLogo,
    showBreadcrumb,
    showFooter,
    contentFullScreen,
    setPageTransition,
    resetSettings
  }
}) 