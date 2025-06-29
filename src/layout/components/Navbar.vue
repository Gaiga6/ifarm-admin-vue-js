<template>
  <div class="navbar" :class="{ 'fixed-header': themeStore.fixedHeader }">
    <!-- 折叠按钮 -->
    <div class="hamburger-container" @click="toggleSidebar">
      <el-icon :class="{ 'is-active': !themeStore.sidebarCollapsed }">
        <Expand v-if="themeStore.sidebarCollapsed" />
        <Fold v-else />
      </el-icon>
    </div>
    
    <!-- 面包屑 -->
    <breadcrumb v-if="themeStore.showBreadcrumb" class="breadcrumb-container" />
    
    <div class="right-menu">
      <!-- 全屏按钮 -->
      <div class="right-menu-item" @click="toggleFullScreen">
        <el-tooltip content="全屏" placement="bottom">
          <el-icon><FullScreen /></el-icon>
        </el-tooltip>
      </div>
      
      <!-- 主题切换 -->
      <el-dropdown class="right-menu-item" trigger="click" @command="handleThemeCommand">
        <div>
          <el-tooltip content="主题设置" placement="bottom">
            <el-icon><Setting /></el-icon>
          </el-tooltip>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="toggleDarkMode">
              <span>{{ themeStore.darkMode ? '浅色模式' : '深色模式' }}</span>
            </el-dropdown-item>
            <el-dropdown-item command="toggleTagsView">
              <span>{{ themeStore.showTagsView ? '隐藏标签栏' : '显示标签栏' }}</span>
            </el-dropdown-item>
            <el-dropdown-item command="toggleFixedHeader">
              <span>{{ themeStore.fixedHeader ? '取消固定头部' : '固定头部' }}</span>
            </el-dropdown-item>
            <el-dropdown-item command="toggleBreadcrumb">
              <span>{{ themeStore.showBreadcrumb ? '隐藏面包屑' : '显示面包屑' }}</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="resetSettings">
              <span>重置设置</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 主题色选择 -->
      <el-dropdown class="right-menu-item" trigger="click" @command="handleColorCommand">
        <div>
          <el-tooltip content="主题色" placement="bottom">
            <div class="color-picker">
              <div class="color-block" :style="{ backgroundColor: themeStore.primaryColor }"></div>
            </div>
          </el-tooltip>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item 
              v-for="(color, key) in themeStore.PRESET_COLORS" 
              :key="key"
              :command="color"
            >
              <div class="color-item">
                <div class="color-block" :style="{ backgroundColor: color }"></div>
                <span>{{ key }}</span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 用户头像 -->
      <el-dropdown class="avatar-container right-menu-item" trigger="click">
        <div class="avatar-wrapper">
          <el-avatar :size="30" :src="userStore.avatar" />
          <el-icon><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/profile/index">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided @click="logout">
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '@/store/theme'
import { useUserStore } from '@/store/user'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const userStore = useUserStore()

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  themeStore.toggleSidebarCollapse()
}

// 切换全屏
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

// 处理主题命令
const handleThemeCommand = (command) => {
  switch (command) {
    case 'toggleDarkMode':
      themeStore.toggleDarkMode()
      break
    case 'toggleTagsView':
      themeStore.toggleTagsView()
      break
    case 'toggleFixedHeader':
      themeStore.toggleFixedHeader()
      break
    case 'toggleBreadcrumb':
      themeStore.toggleBreadcrumb()
      break
    case 'resetSettings':
      themeStore.resetSettings()
      break
    default:
      break
  }
}

// 处理主题色命令
const handleColorCommand = (color) => {
  themeStore.changePrimaryColor(color)
}

// 退出登录
const logout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('退出成功')
  } catch (error) {
    console.error('退出失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  display: flex;
  align-items: center;
  
  &.fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - v-bind('themeStore.sidebarCollapsed ? "64px" : "210px"'));
    transition: width 0.3s;
  }
  
  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    padding: 0 15px;
    cursor: pointer;
    transition: background 0.3s;
    
    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
    
    .el-icon {
      font-size: 20px;
      
      &.is-active {
        transform: rotate(180deg);
      }
    }
  }
  
  .breadcrumb-container {
    float: left;
  }
  
  .right-menu {
    float: right;
    height: 100%;
    display: flex;
    align-items: center;
    
    .right-menu-item {
      display: inline-block;
      padding: 0 12px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: middle;
      cursor: pointer;
      
      &.hover-effect {
        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }
    
    .avatar-container {
      .avatar-wrapper {
        display: flex;
        align-items: center;
        
        .el-avatar {
          margin-right: 5px;
        }
      }
    }
    
    .color-picker {
      display: flex;
      align-items: center;
      
      .color-block {
        width: 20px;
        height: 20px;
        border-radius: 4px;
      }
    }
  }
}

:deep(.el-dropdown-menu) {
  .color-item {
    display: flex;
    align-items: center;
    
    .color-block {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      margin-right: 8px;
    }
  }
}

// 深色模式
.dark {
  .navbar {
    background: #1f2d3d;
    color: #eee;
    
    .right-menu {
      .right-menu-item {
        color: #eee;
      }
    }
  }
}
</style> 