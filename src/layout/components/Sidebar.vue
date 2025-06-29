<template>
  <div class="sidebar-container" :class="{ 'is-collapsed': themeStore.sidebarCollapsed }">
    <!-- Logo -->
    <div v-if="themeStore.showSidebarLogo" class="logo-container">
      <router-link to="/">
        <img src="@/assets/vue.svg" class="sidebar-logo" />
        <transition name="fade">
          <h1 class="sidebar-title" v-show="!themeStore.sidebarCollapsed">iFarm Admin</h1>
        </transition>
      </router-link>
    </div>
    
    <!-- 菜单 -->
    <el-scrollbar :always="false" class="sidebar-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="themeStore.sidebarCollapsed"
        :background-color="menuBgColor"
        :text-color="menuTextColor"
        :active-text-color="menuActiveTextColor"
        :unique-opened="true"
        :collapse-transition="false"
        router
      >
        <sidebar-item 
          v-for="route in permissionRoutes" 
          :key="route.path" 
          :item="route" 
          :base-path="route.path" 
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/store/theme'
import { usePermissionStore } from '@/store/permission'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const themeStore = useThemeStore()
const permissionStore = usePermissionStore()

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) {
    return meta.activeMenu
  }
  return path
})

// 权限路由
const permissionRoutes = computed(() => {
  return permissionStore.routes
})

// 菜单背景色
const menuBgColor = computed(() => {
  return themeStore.darkMode ? '#304156' : '#fff'
})

// 菜单文字颜色
const menuTextColor = computed(() => {
  return themeStore.darkMode ? '#bfcbd9' : '#303133'
})

// 菜单激活文字颜色
const menuActiveTextColor = computed(() => {
  return themeStore.primaryColor
})

// 监听窗口大小变化，自动折叠侧边栏
const handleResize = () => {
  if (document.body.clientWidth < 992 && !themeStore.sidebarCollapsed) {
    themeStore.toggleSidebarCollapse()
  }
}

// 挂载时添加窗口大小变化监听
onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  // 初始检查
  handleResize()
})

// 卸载前移除监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.sidebar-container {
  height: 100%;
  background-color: var(--el-menu-bg-color);
  transition: width $--transition-duration;
  width: $--sidebar-width;
  overflow-x: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  
  &.is-collapsed {
    width: $--sidebar-collapsed-width;
    
    .logo-container {
      padding: $--spacing-small;
      justify-content: center;
      
      .sidebar-logo {
        margin-right: 0;
      }
    }
    
    :deep(.el-menu) {
      // 折叠时隐藏文字
      .el-sub-menu__title span,
      .el-menu-item span {
        display: none;
      }
      
      // 折叠时隐藏箭头
      .el-sub-menu__icon-arrow {
        display: none;
      }
      
      // 折叠时图标居中
      .el-menu-item, .el-sub-menu__title {
        .el-icon {
          margin: 0 auto;
          width: 24px;
          text-align: center;
        }
      }
    }
  }
  
  .logo-container {
    height: $--header-height;
    padding: $--spacing-base;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    transition: all $--transition-duration;
    overflow: hidden;
    border-bottom: 1px solid var(--el-border-color-light);
    
    a {
      display: flex;
      align-items: center;
      height: 100%;
      text-decoration: none;
    }
    
    .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: $--spacing-medium;
      transition: all $--transition-duration;
    }
    
    .sidebar-title {
      display: inline-block;
      margin: 0;
      color: var(--el-menu-text-color);
      font-weight: 600;
      font-size: 16px;
      white-space: nowrap;
      transition: all $--transition-duration;
    }
  }
  
  .sidebar-scrollbar {
    height: calc(100% - #{$--header-height});
    
    // 自定义滚动条样式
    :deep(.el-scrollbar__bar) {
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    &:hover {
      :deep(.el-scrollbar__bar) {
        opacity: 1;
      }
    }
  }
  
  :deep(.el-menu) {
    border-right: none;
    
    // 优化菜单项样式
    .el-menu-item, .el-sub-menu__title {
      height: 50px;
      line-height: 50px;
      padding: 0 20px !important;
      
      &:hover {
        background-color: var(--el-menu-hover-bg-color) !important;
      }
      
      &.is-active {
        background-color: var(--el-menu-hover-bg-color) !important;
        color: var(--el-menu-active-color) !important;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: var(--el-color-primary);
        }
      }
      
      .el-icon {
        vertical-align: middle;
        margin-right: 8px;
        width: 24px;
        text-align: center;
        font-size: 18px;
      }
    }
    
    .el-sub-menu {
      .el-menu-item {
        min-width: auto;
        
        &.is-active {
          background-color: var(--el-menu-hover-bg-color) !important;
        }
      }
    }
    
    // 修复折叠菜单样式
    &.el-menu--collapse {
      width: $--sidebar-collapsed-width;
      
      .el-sub-menu {
        &.is-active {
          > .el-sub-menu__title {
            color: var(--el-menu-active-color) !important;
          }
        }
      }
    }
  }
}

// 深色模式变量
:root {
  --el-menu-bg-color: #fff;
  --el-menu-text-color: #303133;
  --el-menu-active-color: var(--el-color-primary);
  --el-menu-hover-bg-color: #ecf5ff;
}

.dark {
  --el-menu-bg-color: #304156;
  --el-menu-text-color: #bfcbd9;
  --el-menu-active-color: #fff;
  --el-menu-hover-bg-color: #263445;
}
</style> 