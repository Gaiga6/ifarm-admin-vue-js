<template>
  <div class="login-container" :class="{ 'dark': isDark }">
    <div class="login-panel">
      <div class="login-logo">
        <h1>iFarm Admin</h1>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            show-password
            prefix-icon="Lock"
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <a href="javascript:;" class="forget-link">忘记密码?</a>
        </el-form-item>
        
        <el-button type="primary" :loading="loading" class="login-button" @click="handleLogin">
          登录
        </el-button>
      </el-form>
      
      <div class="theme-toggle">
        <el-button text @click="toggleDarkMode">
          <el-icon><Moon v-if="!isDark" /><Sunny v-else /></el-icon>
          {{ isDark ? '浅色模式' : '深色模式' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Moon, Sunny } from '@element-plus/icons-vue'
import { useThemeStore } from '../../store/theme'

const router = useRouter()
const themeStore = useThemeStore()
const loading = ref(false)
const loginFormRef = ref(null)

// 登录表单
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  remember: false
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' }
  ]
}

// 是否为暗黑模式
const isDark = computed(() => themeStore.isDark)

// 切换暗黑模式
const toggleDarkMode = () => {
  themeStore.toggleDarkMode()
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    try {
      // 实际开发中这里应该调用API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟成功
      localStorage.setItem('token', 'demo-token')
      if (loginForm.remember) {
        localStorage.setItem('username', loginForm.username)
      }
      
      ElMessage({
        type: 'success',
        message: '登录成功'
      })
      
      // 跳转到首页
      router.push({ path: '/' })
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 组件挂载时加载主题设置
onMounted(() => {
  themeStore.loadThemeSettings()
})
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #65B581, #4CA2CD);
  transition: all 0.3s;
  
  &.dark {
    background: linear-gradient(135deg, #243B55, #141E30);
  }
  
  .login-panel {
    width: 380px;
    padding: 30px;
    border-radius: 8px;
    background-color: var(--app-container-background);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    
    .login-logo {
      text-align: center;
      margin-bottom: 30px;
      
      h1 {
        color: var(--app-text-color);
        font-size: 24px;
      }
    }
    
    .login-form {
      margin-bottom: 20px;
      
      .el-input {
        height: 40px;
      }
      
      .forget-link {
        float: right;
        color: var(--el-color-primary);
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
    
    .login-button {
      width: 100%;
      margin-top: 10px;
      height: 45px;
      font-size: 16px;
    }
    
    .theme-toggle {
      text-align: center;
      margin-top: 20px;
    }
  }
}
</style> 