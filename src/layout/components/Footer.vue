<template>
  <div v-if="themeStore.showFooter" class="app-footer">
    <div class="copyright">
      Copyright © 2024 iFarm Admin. All Rights Reserved.
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()
</script>

<style lang="scss" scoped>
.app-footer {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  border-top: 1px solid #e6e6e6;
  
  .copyright {
    text-align: center;
  }
}

// 深色模式
.dark {
  .app-footer {
    color: #ccc;
    border-top: 1px solid #263445;
  }
}
</style> 