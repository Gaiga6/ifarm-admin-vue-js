<template>
  <div class="app-wrapper" :class="{ 'dark': themeStore.darkMode }">
    <!-- 侧边栏 -->
    <sidebar class="sidebar-container" />
    
    <!-- 主容器 -->
    <div class="main-container" :class="{ 'sidebar-collapsed': themeStore.sidebarCollapsed }">
      <!-- 顶部导航栏 -->
      <navbar />
      
      <!-- 标签页导航 -->
      <tags-view />
      
      <!-- 主内容区域 -->
      <app-main />
      
      <!-- 页脚 -->
      <footer-bar />
    </div>
    
    <!-- 设置面板 -->
    <settings />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useThemeStore } from '@/store/theme'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import TagsView from './components/TagsView.vue'
import AppMain from './components/AppMain.vue'
import FooterBar from './components/Footer.vue'
import Settings from './components/Settings.vue'

const themeStore = useThemeStore()

// 初始化主题
onMounted(() => {
  // 监听系统暗色模式变化
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  // 如果没有存储过主题设置，则根据系统设置初始化
  if (localStorage.getItem('theme-settings') === null && darkModeMediaQuery.matches) {
    themeStore.toggleDarkMode()
  }
  
  // 监听系统主题变化
  darkModeMediaQuery.addEventListener('change', (e) => {
    if (e.matches && !themeStore.darkMode) {
      themeStore.toggleDarkMode()
    } else if (!e.matches && themeStore.darkMode) {
      themeStore.toggleDarkMode()
    }
  })
})
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  
  .sidebar-container {
    transition: width 0.3s;
    width: 210px;
    height: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1001;
    overflow: hidden;
  }
  
  .main-container {
    min-height: 100%;
    transition: margin-left 0.3s;
    margin-left: 210px;
    position: relative;
    width: calc(100% - 210px);
    display: flex;
    flex-direction: column;
    
    &.sidebar-collapsed {
      margin-left: 64px;
      width: calc(100% - 64px);
    }
  }
}

// 响应式布局
@media (max-width: 768px) {
  .app-wrapper {
    .sidebar-container {
      width: 0;
      
      &.is-active {
        width: 210px;
      }
    }
    
    .main-container {
      margin-left: 0 !important;
      width: 100% !important;
    }
  }
}
</style> 