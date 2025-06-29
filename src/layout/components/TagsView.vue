<template>
  <div v-if="themeStore.showTagsView" class="tags-view-container">
    <el-scrollbar class="tags-view-wrapper" ref="scrollbarRef">
      <router-link
        v-for="tag in themeStore.visitedViews"
        :key="tag.path"
        :to="{ path: tag.path }"
        class="tags-view-item"
        :class="isActive(tag) ? 'active' : ''"
        @click.middle="closeSelectedTag(tag)"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        <el-icon v-if="tag.meta && tag.meta.icon" class="tag-icon">
          <component :is="tag.meta.icon" />
        </el-icon>
        <span class="tag-title">{{ tag.title }}</span>
        <el-icon class="close-icon" @click.prevent.stop="closeSelectedTag(tag)">
          <Close />
        </el-icon>
      </router-link>
    </el-scrollbar>
    
    <!-- 快速操作按钮 -->
    <div class="tags-view-actions">
      <el-dropdown trigger="click" @command="handleTagCommand">
        <el-button size="small" type="primary" plain class="action-button">
          <el-icon><Operation /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
            <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <!-- 右键菜单 -->
    <ul v-show="visible" class="contextmenu" :style="{ left: left + 'px', top: top + 'px' }">
      <li @click="refreshSelectedTag(selectedTag)">刷新</li>
      <li @click="closeSelectedTag(selectedTag)">关闭</li>
      <li @click="closeOthersTags(selectedTag)">关闭其他</li>
      <li @click="closeAllTags">关闭所有</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/store/theme'
import { ArrowDown, Operation } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const scrollbarRef = ref(null)

// 右键菜单相关
const visible = ref(false)
const left = ref(0)
const top = ref(0)
const selectedTag = ref({})

// 判断是否为激活标签
const isActive = (tag) => {
  return tag.path === route.path
}

// 添加当前视图到标签
const addTags = () => {
  const { name, path, meta } = route
  if (name) {
    themeStore.addVisitedView({
      name,
      path,
      meta
    })
    themeStore.addCachedView(route)
  }
}

// 移动到当前标签
const moveToCurrentTag = () => {
  nextTick(() => {
    if (scrollbarRef.value) {
      const tags = document.querySelectorAll('.tags-view-item')
      for (const tag of tags) {
        if (tag.classList.contains('active')) {
          scrollbarRef.value.setScrollLeft(tag.offsetLeft - 80)
          break
        }
      }
    }
  })
}

// 关闭选中标签
const closeSelectedTag = (tag) => {
  themeStore.delVisitedView(tag)
  themeStore.delCachedView(tag)
  
  if (isActive(tag)) {
    toLastTag()
  }
}

// 刷新选中标签
const refreshSelectedTag = (tag) => {
  themeStore.delCachedView(tag)
  router.replace({
    path: '/redirect' + tag.path
  })
}

// 关闭其他标签
const closeOthersTags = (tag) => {
  themeStore.delOthersViews(tag)
  
  if (!isActive(tag)) {
    router.push(tag.path)
  }
}

// 关闭所有标签
const closeAllTags = () => {
  themeStore.delAllViews()
  router.push('/')
}

// 处理标签操作
const handleTagCommand = (command) => {
  switch (command) {
    case 'closeOthers':
      closeOthersTags(route)
      break
    case 'closeAll':
      closeAllTags()
      break
    default:
      break
  }
}

// 跳转到最后一个标签
const toLastTag = () => {
  const latestView = themeStore.visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.path)
  } else {
    router.push('/')
  }
}

// 打开右键菜单
const openMenu = (tag, e) => {
  const menuMinWidth = 105
  const offsetLeft = e.clientX
  const offsetWidth = document.body.offsetWidth
  const maxLeft = offsetWidth - menuMinWidth
  
  left.value = offsetLeft > maxLeft ? maxLeft : offsetLeft
  top.value = e.clientY
  
  visible.value = true
  selectedTag.value = tag
}

// 关闭右键菜单
const closeMenu = () => {
  visible.value = false
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    addTags()
    moveToCurrentTag()
  }
)

// 监听点击事件，关闭右键菜单
onMounted(() => {
  document.addEventListener('click', closeMenu)
  addTags()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: var(--el-bg-color);
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 8;
  
  .tags-view-wrapper {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    padding: 0;
    margin: 0;
    
    :deep(.el-scrollbar__wrap) {
      padding: 0;
      margin: 0;
    }
    
    :deep(.el-scrollbar__view) {
      display: inline-flex;
      align-items: center;
      height: 100%;
      padding: 0;
      margin: 0;
    }
    
    .tags-view-item {
      display: inline-flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: var(--el-text-color-primary);
      background: var(--el-bg-color);
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      margin-bottom: 4px;
      border-radius: 3px;
      transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      text-decoration: none;
      
      &:first-of-type {
        margin-left: 15px;
      }
      
      &:last-of-type {
        margin-right: 15px;
      }
      
      &:hover {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary-light-5);
        
        .close-icon {
          opacity: 1;
        }
      }
      
      &.active {
        background-color: var(--el-color-primary);
        color: #fff;
        border-color: var(--el-color-primary);
        
        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 4px;
        }
        
        .close-icon {
          color: #fff;
          
          &:hover {
            background-color: rgba(255, 255, 255, 0.3);
          }
        }
      }
      
      .tag-icon {
        margin-right: 4px;
        width: 14px;
        height: 14px;
      }
      
      .tag-title {
        max-width: 80px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      
      .close-icon {
        width: 16px;
        height: 16px;
        vertical-align: middle;
        border-radius: 50%;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        transform-origin: 100% 50%;
        margin-left: 4px;
        opacity: 0.6;
        
        &:hover {
          background-color: #b4bccc;
          color: #fff;
          opacity: 1;
        }
      }
    }
  }
  
  .tags-view-actions {
    padding-right: 15px;
    display: flex;
    align-items: center;
    min-width: 50px;
    justify-content: flex-end;
    
    .action-button {
      padding: 6px;
      height: auto;
      
      .el-icon {
        margin: 0;
      }
    }
  }
  
  .contextmenu {
    margin: 0;
    background: var(--el-bg-color);
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-primary);
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      
      &:hover {
        background: var(--el-color-primary-light-9);
      }
    }
  }
}

// 深色模式
.dark {
  .tags-view-container {
    background: #1f2d3d;
    border-bottom: 1px solid #2d3a4b;
    
    .tags-view-wrapper {
      .tags-view-item {
        border: 1px solid #2d3a4b;
        color: #eee;
        background: #1f2d3d;
        
        &.active {
          background-color: var(--el-color-primary);
          color: #fff;
          border-color: var(--el-color-primary);
        }
        
        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
    
    .contextmenu {
      background: #304156;
      color: #eee;
      
      li {
        &:hover {
          background: #263445;
        }
      }
    }
  }
}
</style> 