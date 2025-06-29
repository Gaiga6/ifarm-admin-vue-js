<template>
  <section class="app-main" :class="{ 'content-full-screen': themeStore.contentFullScreen }">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="key" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/store/theme'

const route = useRoute()
const themeStore = useThemeStore()

// 路由缓存列表
const cachedViews = computed(() => themeStore.cachedViews)

// 用于强制组件重新渲染的key
const key = computed(() => {
  return route.path
})
</script>

<style lang="scss" scoped>
.app-main {
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 10px;
  background-color: #f0f2f5;
  transition: all 0.3s;
  
  &.content-full-screen {
    padding: 0;
  }
}

.fixed-header + .app-main {
  padding-top: 50px;
}

// 路由过渡动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

// 深色模式
.dark {
  .app-main {
    background-color: #304156;
  }
}
</style> 