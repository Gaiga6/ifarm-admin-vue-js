<template>
  <section class="app-main" :class="{ 'content-full-screen': themeStore.contentFullScreen }">
    <div class="debug-info" v-if="showDebugInfo">
      <p>当前路由: {{ route.path }}</p>
      <p>缓存视图: {{ cachedViews }}</p>
      <p>主题设置: {{ JSON.stringify(themeSettings) }}</p>
      <button @click="refreshView">强制刷新视图</button>
    </div>
    
    <router-view v-slot="{ Component, route }">
      <transition 
        :name="pageTransitionName" 
        mode="out-in"
        @before-leave="beforeLeave"
        @after-leave="afterLeave"
      >
        <keep-alive :include="cachedViews">
          <component 
            :is="Component" 
            :key="route.path" 
            v-if="!routeDisabled"
          />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/store/theme'
import { useSettingsStore } from '@/store/settings'

const route = useRoute()
const themeStore = useThemeStore()
const settingsStore = useSettingsStore()

// 调试模式
const showDebugInfo = ref(true)

// 主题设置摘要
const themeSettings = computed(() => ({
  showTagsView: themeStore.showTagsView,
  showFooter: themeStore.showFooter,
  fixedHeader: themeStore.fixedHeader,
  contentFullScreen: themeStore.contentFullScreen
}))

// 路由缓存列表
const cachedViews = computed(() => themeStore.cachedViews)

// 页面过渡动画名称
const pageTransitionName = ref('fade-transform')

// 用于控制组件销毁和重建
const routeDisabled = ref(false)

// 调试日志函数
const logDebug = (message, data) => {
  console.log(`%c[AppMain调试] ${message}`, 'color: #F56C6C; font-weight: bold;', data || '')
}

// 监听路由变化，输出调试信息
watch(
  () => route.path,
  (newPath, oldPath) => {
    logDebug('路由路径变化', { 
      from: oldPath, 
      to: newPath, 
      currentRoute: route,
      cachedViews: cachedViews.value 
    })
  },
  { immediate: true }
)

// 监听主题设置中的页面切换动画
watch(
  () => settingsStore.pageTransition,
  (val) => {
    if (val) {
      pageTransitionName.value = val
      logDebug('页面过渡动画更新', val)
    } else {
      pageTransitionName.value = 'fade-transform'
      logDebug('使用默认页面过渡动画')
    }
  },
  { immediate: true }
)

// 过渡动画钩子
const beforeLeave = () => {
  // 可以在这里添加离开页面前的逻辑
  logDebug('页面过渡前', route.path)
}

const afterLeave = () => {
  // 可以在这里添加页面离开后的逻辑
  window.scrollTo(0, 0)
  logDebug('页面过渡后，滚动到顶部', route.path)
}

// 使用Intersection Observer API优化性能
let observer = null

onMounted(() => {
  logDebug('AppMain组件已挂载', {
    route: route.path,
    themeSettings: themeSettings.value
  })
  
  // 创建交叉观察器，用于检测元素是否在视口中
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // 如果元素不在视口中，可以暂停一些操作
      if (!entry.isIntersecting) {
        // 例如暂停视频、动画等
      } else {
        // 元素进入视口时恢复
      }
    })
  })
  
  // 观察当前页面内的重要元素
  const appMain = document.querySelector('.app-main')
  if (appMain) {
    observer.observe(appMain)
  }
})

onBeforeUnmount(() => {
  // 清理观察器
  if (observer) {
    observer.disconnect()
  }
})

// 强制重新渲染组件的方法（可以暴露给父组件使用）
const refreshView = () => {
  routeDisabled.value = true
  nextTick(() => {
    routeDisabled.value = false
  })
}

// 暴露方法给父组件
defineExpose({
  refreshView
})
</script>

<style lang="scss" scoped>
@import "@/styles/theme/variables.scss";
@import '@/styles/variables.scss';

.app-main {
  /* 84 = navbar(50) + tags-view(34) */
  min-height: calc(100vh - 84px);
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 15px;
  box-sizing: border-box;
  background-color: var(--el-fill-color-lighter);
  transition: all $--transition-duration;
  
  &.content-full-screen {
    padding: 0;
  }
}

.fixed-header + .app-main {
  padding-top: 84px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }
}

.no-tags-view {
  .app-main {
    /* 50 = navbar */
    min-height: calc(100vh - 50px);
  }
}

.page-loading {
  padding: $--spacing-large;
}

.debug-info {
  position: fixed;
  top: 100px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #dcdfe6;
  padding: 10px;
  border-radius: 4px;
  z-index: 2000;
  font-size: 12px;
  max-width: 300px;
  overflow: auto;
  max-height: 300px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

// 使用CSS变量处理主题
:root {
  --app-main-bg-color: var(--el-fill-color-lighter);
  --app-main-text-color: var(--el-text-color-primary);
}

.dark {
  --app-main-bg-color: var(--el-bg-color-page);
  --app-main-text-color: var(--el-text-color-primary);
}
</style> 