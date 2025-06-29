<template>
  <div class="settings-container">
    <!-- 设置触发按钮 -->
    <div class="settings-trigger" @click="showDrawer = true">
      <el-tooltip content="系统设置" placement="left">
        <el-button type="primary" circle>
          <el-icon><Setting /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
    
    <!-- 设置抽屉 -->
    <el-drawer
      v-model="showDrawer"
      title="系统设置"
      direction="rtl"
      size="300px"
      :with-header="true"
      :destroy-on-close="false"
      :before-close="handleClose"
    >
      <div class="drawer-content">
        <el-scrollbar height="100%">
          <div class="setting-section">
            <div class="section-header">
              <span>主题设置</span>
              <el-button type="primary" link @click="themeStore.resetSettings">
                重置
              </el-button>
            </div>
            
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
          </div>
          
          <el-divider />
          
          <div class="setting-section">
            <div class="section-header">
              <span>界面显示</span>
            </div>
            
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
          
          <el-divider />
          
          <div class="setting-section">
            <div class="section-header">
              <span>动画效果</span>
            </div>
            
            <div class="setting-item">
              <span>页面切换动画</span>
              <el-select v-model="pageTransition" placeholder="选择动画" style="width: 120px">
                <el-option label="淡入淡出" value="fade" />
                <el-option label="滑动" value="slide" />
                <el-option label="缩放" value="zoom" />
                <el-option label="无" value="none" />
              </el-select>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useThemeStore } from '@/store/theme'
import { Setting } from '@element-plus/icons-vue'

const themeStore = useThemeStore()
const showDrawer = ref(false)

// 页面过渡动画（预留功能）
const pageTransition = ref('fade')

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

// 关闭抽屉
const handleClose = () => {
  showDrawer.value = false
}

// 监听主题变化，更新页面样式
watch(
  () => themeStore.darkMode,
  (isDark) => {
    // 可以在这里添加更多的主题切换逻辑
  }
)
</script>

<style lang="scss" scoped>
.settings-container {
  .settings-trigger {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2000;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-50%) scale(1.1);
    }
  }
  
  .drawer-content {
    height: 100%;
    
    .setting-section {
      padding: 0 16px;
      
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        font-weight: bold;
        font-size: 16px;
      }
      
      .setting-item {
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        span {
          color: var(--el-text-color-primary);
        }
      }
      
      .theme-colors {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .color-item {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.2s;
          box-shadow: 0 0 1px rgba(0, 0, 0, 0.2);
          
          &:hover {
            transform: scale(1.2);
          }
          
          &.active {
            position: relative;
            
            &::after {
              content: '✓';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-size: 14px;
              text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
            }
          }
        }
      }
    }
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-drawer__body) {
  padding: 0;
}
</style> 