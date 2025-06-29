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
        {{ tag.title }}
        <el-icon class="close-icon" @click.prevent.stop="closeSelectedTag(tag)">
          <Close />
        </el-icon>
      </router-link>
    </el-scrollbar>
    
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
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      border-radius: 3px;
      
      &:first-of-type {
        margin-left: 15px;
      }
      
      &:last-of-type {
        margin-right: 15px;
      }
      
      &.active {
        background-color: v-bind('themeStore.primaryColor');
        color: #fff;
        border-color: v-bind('themeStore.primaryColor');
        
        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
      
      .close-icon {
        width: 16px;
        height: 16px;
        vertical-align: -0.3em;
        border-radius: 50%;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        transform-origin: 100% 50%;
        margin-left: 2px;
        
        &:hover {
          background-color: #b4bccc;
          color: #fff;
        }
      }
    }
  }
  
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      
      &:hover {
        background: #eee;
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
          background-color: v-bind('themeStore.primaryColor');
          color: #fff;
          border-color: v-bind('themeStore.primaryColor');
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