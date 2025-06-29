<template>
  <div class="sidebar-container" :class="{ 'is-collapsed': themeStore.sidebarCollapsed }">
    <!-- Logo -->
    <div v-if="themeStore.showLogo" class="logo-container">
      <router-link to="/">
        <img src="@/assets/vue.svg" class="sidebar-logo" />
        <h1 class="sidebar-title" v-show="!themeStore.sidebarCollapsed">iFarm Admin</h1>
      </router-link>
    </div>
    
    <!-- 菜单 -->
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="themeStore.sidebarCollapsed"
        :background-color="menuBgColor"
        :text-color="menuTextColor"
        :active-text-color="menuActiveTextColor"
        :unique-opened="true"
        router
      >
        <sidebar-item 
          v-for="route in permissionStore.routes" 
          :key="route.path" 
          :item="route" 
          :base-path="route.path" 
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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

// 菜单背景色
const menuBgColor = computed(() => {
  return themeStore.darkMode ? '#1f2d3d' : '#fff'
})

// 菜单文字颜色
const menuTextColor = computed(() => {
  return themeStore.darkMode ? '#bfcbd9' : '#303133'
})

// 菜单激活文字颜色
const menuActiveTextColor = computed(() => {
  return themeStore.primaryColor
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  background-color: v-bind(menuBgColor);
  transition: width 0.3s;
  width: 210px;
  
  &.is-collapsed {
    width: 64px;
  }
  
  .logo-container {
    height: 50px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    
    .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
    }
    
    .sidebar-title {
      display: inline-block;
      margin: 0;
      color: v-bind(menuTextColor);
      font-weight: 600;
      font-size: 16px;
      white-space: nowrap;
    }
  }
  
  :deep(.el-menu) {
    border-right: none;
  }
}
</style> 