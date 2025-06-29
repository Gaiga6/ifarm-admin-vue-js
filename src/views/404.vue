<template>
  <div class="not-found">
    <div class="container">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  
  .container {
    text-align: center;
    padding: 20px;
    
    h1 {
      font-size: 120px;
      margin: 0;
      color: var(--el-color-primary);
    }
    
    h2 {
      font-size: 30px;
      margin: 0;
      margin-bottom: 20px;
    }
    
    p {
      font-size: 16px;
      color: #909399;
      margin-bottom: 30px;
    }
  }
}

// 深色模式
.dark {
  .not-found {
    background-color: #304156;
    
    .container {
      h2 {
        color: #eee;
      }
      
      p {
        color: #ccc;
      }
    }
  }
}
</style> 