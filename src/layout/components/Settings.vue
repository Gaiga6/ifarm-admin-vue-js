<template>
  <div class="settings-panel" :class="{ 'show-settings': showSettings }">
    <div class="settings-trigger" @click="toggleSettings">
      <el-icon><Setting /></el-icon>
    </div>
    
    <div class="settings-content">
      <div class="settings-header">
        <span>系统设置</span>
        <el-button type="primary" link @click="themeStore.resetSettings">
          重置
        </el-button>
      </div>
      
      <div class="settings-body">
        <div class="setting-item">
          <span>主题模式</span>
          <el-switch
            v-model="darkMode"
            inline-prompt
            active-text="暗"
            inactive-text="亮"
            @change="themeStore.toggleDarkMode"
          />
        </div>
        
        <div class="setting-item">
          <span>主题颜色</span>
          <div class="theme-colors">
            <div
              v-for="(color, key) in themeStore.PRESET_COLORS"
              :key="key"
              class="color-item"
              :class="{ active: themeStore.primaryColor === color }"
              :style="{ backgroundColor: color }"
              @click="themeStore.changePrimaryColor(color)"
            ></div>
          </div>
        </div>
        
        <el-divider>界面显示</el-divider>
        
        <div class="setting-item">
          <span>侧边栏折叠</span>
          <el-switch
            v-model="sidebarCollapsed"
            @change="themeStore.toggleSidebarCollapse"
          />
        </div>
        
        <div class="setting-item">
          <span>固定头部</span>
          <el-switch
            v-model="fixedHeader"
            @change="themeStore.toggleFixedHeader"
          />
        </div>
        
        <div class="setting-item">
          <span>显示标签栏</span>
          <el-switch
            v-model="showTagsView"
            @change="themeStore.toggleTagsView"
          />
        </div>
        
        <div class="setting-item">
          <span>显示面包屑</span>
          <el-switch
            v-model="showBreadcrumb"
            @change="themeStore.toggleBreadcrumb"
          />
        </div>
        
        <div class="setting-item">
          <span>显示Logo</span>
          <el-switch
            v-model="showLogo"
            @change="themeStore.toggleLogo"
          />
        </div>
        
        <div class="setting-item">
          <span>显示页脚</span>
          <el-switch
            v-model="showFooter"
            @change="themeStore.toggleFooter"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()
const showSettings = ref(false)

// 计算属性，用于双向绑定
const darkMode = computed({
  get: () => themeStore.darkMode,
  set: () => {}
})

const sidebarCollapsed = computed({
  get: () => themeStore.sidebarCollapsed,
  set: () => {}
})

const fixedHeader = computed({
  get: () => themeStore.fixedHeader,
  set: () => {}
})

const showTagsView = computed({
  get: () => themeStore.showTagsView,
  set: () => {}
})

const showBreadcrumb = computed({
  get: () => themeStore.showBreadcrumb,
  set: () => {}
})

const showLogo = computed({
  get: () => themeStore.showLogo,
  set: () => {}
})

const showFooter = computed({
  get: () => themeStore.showFooter,
  set: () => {}
})

// 切换设置面板
const toggleSettings = () => {
  showSettings.value = !showSettings.value
}
</script>

<style lang="scss" scoped>
.settings-panel {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 2000;
  
  .settings-trigger {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    background: v-bind('themeStore.primaryColor');
    color: #fff;
    font-size: 18px;
    text-align: center;
    border-radius: 4px 0 0 4px;
    cursor: pointer;
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
    
    &:hover {
      opacity: 0.9;
    }
  }
  
  .settings-content {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%) translateX(300px);
    width: 300px;
    height: 500px;
    background: #fff;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
    border-radius: 4px 0 0 4px;
    transition: transform 0.3s;
    
    .settings-header {
      height: 50px;
      line-height: 50px;
      padding: 0 15px;
      font-size: 16px;
      font-weight: bold;
      color: #333;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .settings-body {
      padding: 15px;
      height: calc(100% - 50px);
      overflow-y: auto;
      
      .setting-item {
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        span {
          font-size: 14px;
          color: #606266;
        }
      }
      
      .theme-colors {
        display: flex;
        flex-wrap: wrap;
        
        .color-item {
          width: 20px;
          height: 20px;
          border-radius: 2px;
          margin-right: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          position: relative;
          
          &.active::after {
            content: '✓';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            color: #fff;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.2);
          }
        }
      }
    }
  }
  
  &.show-settings {
    .settings-content {
      transform: translateY(-50%) translateX(0);
    }
  }
}

// 深色模式
.dark {
  .settings-panel {
    .settings-content {
      background: #304156;
      
      .settings-header {
        color: #eee;
        border-bottom: 1px solid #263445;
      }
      
      .settings-body {
        .setting-item {
          span {
            color: #eee;
          }
        }
      }
    }
  }
}
</style> 