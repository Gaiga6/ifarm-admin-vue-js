<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item 
      v-for="(item, index) in breadcrumbs" 
      :key="index"
      :to="index < breadcrumbs.length - 1 ? { path: item.path } : ''"
    >
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbs = ref([])

// 生成面包屑
const getBreadcrumbs = () => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  
  // 移除重复项
  const first = matched[0]
  if (first && first.path === '/') {
    matched.shift()
  }
  
  breadcrumbs.value = matched.map(item => {
    return {
      path: item.path,
      title: item.meta.title
    }
  })
}

// 监听路由变化，更新面包屑
watch(
  () => route.path,
  () => {
    getBreadcrumbs()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.el-breadcrumb {
  font-size: 14px;
  line-height: 1;
  
  :deep(.el-breadcrumb__inner) {
    color: var(--app-text-color);
    
    &.is-link {
      color: var(--el-color-primary);
      font-weight: normal;
    }
  }
}
</style> 