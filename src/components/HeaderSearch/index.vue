<template>
  <div :class="{'show': show}" class="header-search">
    <el-tooltip
      effect="dark"
      content="搜索 (Ctrl+K)"
      placement="bottom"
    >
      <el-button
        class="search-btn"
        circle
        @click.stop="onShowClick"
      >
        <el-icon><Search /></el-icon>
      </el-button>
    </el-tooltip>
    
    <el-dialog
      v-model="dialogVisible"
      title="菜单搜索"
      width="500px"
      :show-close="true"
      @closed="onDialogClose"
    >
      <el-input
        ref="headerSearchInputRef"
        v-model="search"
        placeholder="搜索菜单"
        class="header-search-input"
        @input="onChange"
        @keydown.down.prevent="onKeyDown"
        @keydown.up.prevent="onKeyUp"
        @keydown.enter.prevent="onKeyEnter"
        @keydown.esc.prevent="close"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-scrollbar>
        <div v-show="searchPool.length > 0" class="search-result-list">
          <div
            v-for="(item, index) in searchPool"
            :key="item.path"
            class="search-result-item"
            :class="{ 'selected': index === activeIndex }"
            @click="onItemClick(item)"
            @mouseenter="setActiveIndex(index)"
          >
            <el-icon v-if="item.meta && item.meta.icon" class="item-icon">
              <component :is="item.meta.icon" />
            </el-icon>
            <span class="item-title">{{ item.title }}</span>
            <span class="item-path">{{ item.path }}</span>
          </div>
        </div>
        <div v-show="search.length > 0 && searchPool.length === 0" class="search-empty">
          无匹配结果
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import Fuse from 'fuse.js'
import { useThemeStore } from '@/store/theme'

const router = useRouter()
const themeStore = useThemeStore()

// 搜索相关
const headerSearchInputRef = ref(null)
const search = ref('')
const show = ref(false)
const dialogVisible = ref(false)
const searchPool = ref([])
const fuse = ref(null)
const activeIndex = ref(-1)

// 初始化搜索引擎
const initFuse = (list) => {
  fuse.value = new Fuse(list, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    keys: [{
      name: 'title',
      weight: 0.7
    }, {
      name: 'path',
      weight: 0.3
    }]
  })
}

// 初始化搜索数据
const initSearchData = () => {
  const routes = router.getRoutes()
  const searchPool = []
  
  routes.forEach(route => {
    if (route.meta && route.meta.title) {
      searchPool.push({
        title: route.meta.title,
        path: route.path,
        meta: route.meta
      })
    }
  })
  
  initFuse(searchPool)
}

// 显示搜索框
const onShowClick = () => {
  dialogVisible.value = true
  nextTick(() => {
    headerSearchInputRef.value.focus()
  })
}

// 关闭搜索框
const close = () => {
  dialogVisible.value = false
}

// 对话框关闭事件
const onDialogClose = () => {
  search.value = ''
  activeIndex.value = -1
  searchPool.value = []
}

// 搜索内容变化
const onChange = () => {
  if (search.value) {
    searchPool.value = fuse.value.search(search.value).map(result => result.item)
  } else {
    searchPool.value = []
  }
  activeIndex.value = 0
}

// 键盘向下选择
const onKeyDown = () => {
  if (searchPool.value.length === 0) return
  activeIndex.value = (activeIndex.value + 1) % searchPool.value.length
}

// 键盘向上选择
const onKeyUp = () => {
  if (searchPool.value.length === 0) return
  activeIndex.value = activeIndex.value - 1 < 0 ? searchPool.value.length - 1 : activeIndex.value - 1
}

// 回车选择
const onKeyEnter = () => {
  if (activeIndex.value < 0 || !searchPool.value[activeIndex.value]) return
  onItemClick(searchPool.value[activeIndex.value])
}

// 点击搜索结果
const onItemClick = (item) => {
  router.push(item.path)
  close()
}

// 设置当前激活项
const setActiveIndex = (index) => {
  activeIndex.value = index
}

// 监听快捷键
const handleKeydown = (e) => {
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault()
    onShowClick()
  }
}

// 初始化
onMounted(() => {
  initSearchData()
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.header-search {
  display: inline-flex;
  align-items: center;
  
  .search-btn {
    cursor: pointer;
    font-size: 16px;
    color: var(--el-text-color-primary);
    transition: all 0.3s;
    
    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.header-search-input {
  width: 100%;
  margin-bottom: 15px;
  
  :deep(.el-input__wrapper) {
    box-shadow: none !important;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    
    &:focus-within {
      border-color: var(--el-color-primary);
    }
  }
}

.search-result-list {
  max-height: 400px;
  
  .search-result-item {
    padding: 10px 15px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 4px;
    
    &:hover, &.selected {
      background-color: var(--el-color-primary-light-9);
    }
    
    .item-icon {
      margin-right: 10px;
      font-size: 16px;
      color: var(--el-text-color-secondary);
    }
    
    .item-title {
      flex: 1;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
    
    .item-path {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-left: 10px;
    }
  }
}

.search-empty {
  padding: 20px 0;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style> 