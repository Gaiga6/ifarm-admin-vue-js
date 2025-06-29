<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="themeStore.device === 'mobile' && themeStore.sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    
    <Sidebar class="sidebar-container" />
    
    <div class="main-container">
      <div :class="{'fixed-header': themeStore.fixedHeader}">
        <Navbar />
        <TagsView v-if="themeStore.showTagsView" />
      </div>
      
      <AppMain />
      
      <Footer v-if="themeStore.showFooter" />
    </div>
    
    <Settings />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useThemeStore } from '@/store/theme'
import { AppMain, Navbar, Sidebar, TagsView, Footer, Settings } from './components'

const themeStore = useThemeStore()

const classObj = computed(() => {
  return {
    hideSidebar: !themeStore.sidebar.opened,
    openSidebar: themeStore.sidebar.opened,
    withoutAnimation: themeStore.sidebar.withoutAnimation,
    mobile: themeStore.device === 'mobile',
    'has-tags-view': themeStore.showTagsView,
    'no-tags-view': !themeStore.showTagsView
  }
})

const handleClickOutside = () => {
  themeStore.closeSideBar({ withoutAnimation: false })
}

// 初始化主题
onMounted(() => {
  // 加载主题设置
  themeStore.loadThemeSettings()
  
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
@import "@/styles/variables.scss";

.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  
  &:after {
    content: "";
    display: table;
    clear: both;
  }
  
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - #{$sideBarHiddenWidth});
}

.mobile .fixed-header {
  width: 100%;
}

.has-tags-view {
  .main-container {
    padding-top: 84px; /* navbar + tagsview */
  }
}

.no-tags-view {
  .main-container {
    padding-top: 50px; /* navbar only */
  }
}

.main-container {
  height: 100%;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sidebar-container {
  transition: width 0.3s;
  height: 100%;
  overflow: hidden;
  z-index: 1001;
  
  &.is-collapsed {
    width: 64px !important;
  }
}

.content-container {
  position: relative;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-header {
  padding: 0;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  position: relative;
  z-index: 10;
  
  &.fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 999;
    width: calc(100% - v-bind('themeStore.sidebarCollapsed ? "64px" : "210px"'));
    transition: width 0.3s;
  }
}

.tags-view-wrapper {
  height: 34px;
  width: 100%;
  background-color: var(--el-bg-color);
  position: relative;
  z-index: 9;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  
  &.fixed-header-tags {
    position: fixed;
    top: 50px;
    left: v-bind('themeStore.sidebarCollapsed ? "64px" : "210px"');
    width: calc(100% - v-bind('themeStore.sidebarCollapsed ? "64px" : "210px"'));
    z-index: 998;
    transition: left 0.3s, width 0.3s;
  }
}

.main-content {
  padding: 15px;
  background-color: var(--el-fill-color-lighter);
  min-height: calc(100vh - 50px - 34px - 50px);
  transition: all 0.3s;
  flex: 1;
  overflow-y: auto;
  
  &.no-tags {
    min-height: calc(100vh - 50px - 50px);
  }
  
  &.no-footer {
    min-height: calc(100vh - 50px - 34px);
  }
  
  &.no-tags.no-footer {
    min-height: calc(100vh - 50px);
  }
  
  &.fixed-header-padding {
    padding-top: 65px; // 50px header + 15px padding
    
    &:not(.no-tags) {
      padding-top: 99px; // 50px header + 34px tags + 15px padding
    }
  }
}

.main-footer {
  padding: 0;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 响应式布局
@media (max-width: 992px) {
  .app-wrapper {
    .main-container {
      .sidebar-container {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        transform: translateX(0);
        box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
        
        &.is-collapsed {
          transform: translateX(-100%);
        }
      }
      
      .main-header {
        &.fixed-header {
          width: 100% !important;
        }
      }
      
      .tags-view-wrapper {
        &.fixed-header-tags {
          left: 0;
          width: 100%;
        }
      }
      
      .content-container {
        margin-left: 0 !important;
      }
    }
  }
}

// 深色模式
.dark {
  --el-menu-bg-color: #304156;
  --el-bg-color: #263445;
  --el-fill-color-lighter: #1f2d3d;
  --el-border-color-lighter: #1f2d3d;
  --el-text-color-primary: #E5EAF3;
  --el-color-primary-light-9: #263445;
  
  color-scheme: dark;
}
</style> 