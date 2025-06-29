<template>
  <div class="navbar" :class="{ 'fixed-header': themeStore.fixedHeader }">
    <!-- 左侧区域：折叠按钮和面包屑 -->
    <div class="navbar-left">
      <!-- 折叠按钮 -->
      <div class="hamburger-container hover-effect" @click="toggleSidebar">
        <el-icon :class="{ 'is-active': !themeStore.sidebarCollapsed }">
          <Expand v-if="themeStore.sidebarCollapsed" />
          <Fold v-else />
        </el-icon>
      </div>
      
      <!-- 面包屑 -->
      <breadcrumb v-if="themeStore.showBreadcrumb" class="breadcrumb-container hide-on-sm" />
    </div>
    
    <!-- 中间区域：搜索框 -->
    <div class="navbar-center">
      <header-search />
    </div>
    
    <!-- 右侧区域：功能按钮 -->
    <div class="navbar-right">
      <!-- 全屏按钮 -->
      <div class="right-menu-item hover-effect hide-on-sm" @click="toggleFullScreen">
        <el-tooltip content="全屏" placement="bottom">
          <el-icon><FullScreen /></el-icon>
        </el-tooltip>
      </div>
      
      <!-- 主题切换 -->
      <el-dropdown class="right-menu-item hover-effect hide-on-sm" trigger="click" @command="handleThemeCommand">
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
      <el-dropdown class="right-menu-item hover-effect hide-on-sm" trigger="click" @command="handleColorCommand">
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
      
      <!-- 用户信息 -->
      <el-dropdown class="user-info-container right-menu-item" trigger="click">
        <div class="user-wrapper">
          <el-avatar :size="30" :src="userStore.avatar" />
          <div class="user-info hide-on-sm">
            <span class="username ellipsis">{{ userStore.name }}</span>
            <el-tag size="small" :type="userRoleType">{{ userRoleLabel }}</el-tag>
          </div>
          <el-icon class="el-icon--right"><CaretBottom /></el-icon>
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
import HeaderSearch from '@/components/HeaderSearch/index.vue'
import { ElMessage } from 'element-plus'

const themeStore = useThemeStore()
const userStore = useUserStore()

// 用户角色标签
const userRoleLabel = computed(() => {
  switch (userStore.userType) {
    case 0:
      return '普通用户'
    case 1:
      return '农村管理员'
    case 3:
      return '平台管理员'
    default:
      return '未知角色'
  }
})

// 用户角色类型
const userRoleType = computed(() => {
  switch (userStore.userType) {
    case 0:
      return 'info'
    case 1:
      return 'success'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
})

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
  background: var(--el-bg-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &.fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - v-bind('themeStore.sidebarCollapsed ? "64px" : "210px"'));
    transition: width 0.3s;
  }
  
  .navbar-left {
    display: flex;
    align-items: center;
    
    .hamburger-container {
      line-height: 50px;
      height: 100%;
      padding: 0 15px;
      cursor: pointer;
      transition: background 0.3s;
      display: flex;
      align-items: center;
      
      .el-icon {
        font-size: 20px;
        
        &.is-active {
          transform: rotate(180deg);
        }
      }
    }
    
    .breadcrumb-container {
      padding: 0 15px;
      display: flex;
      align-items: center;
    }
  }
  
  .navbar-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 20px;
    max-width: 500px;
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
    height: 100%;
    
    .right-menu-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 12px;
      height: 100%;
      font-size: 18px;
      color: var(--el-text-color-primary);
      vertical-align: middle;
      cursor: pointer;
    }
    
    .hover-effect {
      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }
    }
    
    .user-info-container {
      padding: 0 15px;
      
      .user-wrapper {
        display: flex;
        align-items: center;
        
        .el-avatar {
          margin-right: 8px;
        }
        
        .user-info {
          margin-right: 5px;
          
          .username {
            display: block;
            max-width: 80px;
            font-size: 14px;
            line-height: 1.2;
            margin-bottom: 2px;
          }
          
          .el-tag {
            transform: scale(0.85);
            transform-origin: left;
          }
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
    
    .hover-effect:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    
    .navbar-right {
      .right-menu-item {
        color: #eee;
      }
    }
  }
}

// 响应式布局
@media (max-width: 992px) {
  .navbar {
    .navbar-center {
      max-width: 60%;
    }
  }
}

@media (max-width: 768px) {
  .navbar {
    .navbar-center {
      max-width: 50%;
      padding: 0 5px;
    }
    
    .navbar-right {
      .right-menu-item {
        padding: 0 8px;
      }
    }
  }
}

@media (max-width: 576px) {
  .navbar {
    .navbar-center {
      max-width: none;
      flex: 1;
      justify-content: flex-start;
    }
  }
}
</style> 