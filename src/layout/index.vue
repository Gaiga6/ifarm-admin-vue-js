<template>
  <div class="app-container" :class="{ 'is-dark': themeStore.isDark }">
    <div class="sidebar" :class="{ 'is-collapsed': isCollapse }">
      <!-- 侧边栏头部Logo -->
      <div class="sidebar-logo">
        <h1 v-if="!isCollapse">iFarm Admin</h1>
        <h1 v-else>iFarm</h1>
      </div>
      
      <!-- 侧边栏菜单 -->
      <el-menu
        :default-active="activeMenu"
        :background-color="themeStore.isDark ? '#1D1E1F' : '#001529'"
        text-color="#FFFFFF"
        :active-text-color="themeStore.primaryColor"
        :collapse="isCollapse"
        router
      >
        <!-- 仪表盘菜单项 -->
        <el-menu-item index="/dashboard">
          <el-icon><Monitor /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        
        <!-- 动态渲染权限菜单 -->
        <template v-for="(route, index) in permissionRoutes" :key="index">
          <!-- 单层菜单 -->
          <el-menu-item 
            v-if="route.children && route.children.length === 1" 
            :index="route.path + '/' + route.children[0].path"
          >
            <el-icon v-if="route.children[0].meta && route.children[0].meta.icon">
              <component :is="route.children[0].meta.icon" />
            </el-icon>
            <template #title>{{ route.children[0].meta.title }}</template>
          </el-menu-item>
          
          <!-- 多层菜单 -->
          <el-sub-menu 
            v-else-if="route.children && route.children.length > 1" 
            :index="route.path"
          >
            <template #title>
              <el-icon v-if="route.meta && route.meta.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ route.meta.title }}</span>
            </template>
            
            <!-- 子菜单 -->
            <template v-for="(subItem, subIndex) in route.children" :key="subIndex">
              <el-menu-item 
                v-if="!subItem.children" 
                :index="route.path + '/' + subItem.path"
              >
                {{ subItem.meta.title }}
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>
      </el-menu>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <div class="navbar-left">
          <el-icon class="menu-toggle" @click="toggleSidebar">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <breadcrumb class="hidden-xs-only" />
        </div>
        
        <div class="navbar-right">
          <!-- 主题切换 -->
          <div class="theme-switch">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="color-picker">
                <div class="current-color" :style="{ backgroundColor: themeStore.primaryColor }"></div>
                <span>主题设置</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="toggleDark">
                    {{ themeStore.isDark ? '浅色模式' : '深色模式' }}
                  </el-dropdown-item>
                  
                  <el-divider />
                  
                  <div class="color-panel">
                    <div
                      v-for="(item, index) in themeStore.colorList"
                      :key="index"
                      class="color-item"
                      :style="{ backgroundColor: item.value }"
                      :title="item.name"
                      @click="setThemeColor(item.value)"
                    ></div>
                  </div>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <!-- 用户头像 -->
          <el-dropdown trigger="click">
            <div class="avatar-container">
              <el-avatar size="small" :src="userStore.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <span>{{ userStore.name || '管理员' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
                <el-dropdown-item @click="goToSetting">账户设置</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 页面内容区域 -->
      <div class="content-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Monitor, Document, Fold, Expand, Setting } from '@element-plus/icons-vue'
import { useThemeStore } from '../store/theme'
import { useUserStore } from '../store/user'
import { usePermissionStore } from '../store/permission'
import Breadcrumb from '../components/Breadcrumb/index.vue'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// 侧边栏是否折叠
const isCollapse = ref(false)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 权限路由
const permissionRoutes = computed(() => permissionStore.routes)

// 设置主题色
const setThemeColor = (color) => {
  themeStore.setPrimaryColor(color)
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'toggleDark') {
    themeStore.toggleDarkMode()
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 跳转到个人中心
const goToProfile = () => {
  router.push('/profile/index')
}

// 跳转到账户设置
const goToSetting = () => {
  // 可以实现账户设置页面
  ElMessageBox.alert('账户设置功能开发中...', '提示')
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
  }).catch(() => {})
}

// 组件挂载时加载主题设置
onMounted(() => {
  themeStore.loadThemeSettings()
})
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  
  .sidebar {
    width: 240px;
    height: 100%;
    background-color: #001529;
    color: #fff;
    transition: all 0.3s;
    
    &.is-collapsed {
      width: 64px;
    }
    
    &-logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.2);
      
      h1 {
        font-size: 18px;
        color: #fff;
        white-space: nowrap;
      }
    }
  }
  
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .navbar {
      height: 60px;
      background-color: var(--app-container-background);
      border-bottom: 1px solid var(--app-border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      
      .navbar-left {
        display: flex;
        align-items: center;
        
        .menu-toggle {
          font-size: 20px;
          cursor: pointer;
          margin-right: 20px;
        }
      }
      
      .navbar-right {
        display: flex;
        align-items: center;
        gap: 20px;
        
        .theme-switch {
          .color-picker {
            display: flex;
            align-items: center;
            cursor: pointer;
            
            .current-color {
              width: 20px;
              height: 20px;
              border-radius: 4px;
              margin-right: 8px;
            }
          }
        }
        
        .avatar-container {
          display: flex;
          align-items: center;
          cursor: pointer;
          
          span {
            margin-left: 8px;
          }
        }
      }
    }
    
    .content-container {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background-color: var(--app-background);
    }
  }
}

// 媒体查询
@media screen and (max-width: 768px) {
  .hidden-xs-only {
    display: none;
  }
}

// 深色模式下的样式调整
.is-dark {
  .sidebar {
    background-color: #1D1E1F;
  }
}

// 颜色面板
.color-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 10px;
  
  .color-item {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.3s;
    
    &:hover {
      transform: scale(1.2);
    }
  }
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 