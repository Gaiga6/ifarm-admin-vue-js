<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
            </div>
          </template>
          <div class="user-info">
            <div class="user-avatar">
              <el-avatar :size="100" :src="userStore.avatar || defaultAvatar" />
              <h3 class="nickname">{{ userStore.name }}</h3>
            </div>
            <div class="user-details">
              <div class="detail-item">
                <span class="label">角色：</span>
                <el-tag v-for="(role, index) in userStore.roles" :key="index" class="role-tag">
                  {{ role }}
                </el-tag>
              </div>
              <div class="detail-item">
                <span class="label">登录时间：</span>
                <span>{{ currentTime }}</span>
              </div>
            </div>
            <div class="user-actions">
              <el-button type="primary" @click="showUpdatePasswordDialog">修改密码</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <div class="tab-title">
                <el-tabs v-model="activeTab">
                  <el-tab-pane label="基本资料" name="basic"></el-tab-pane>
                  <el-tab-pane label="修改头像" name="avatar"></el-tab-pane>
                </el-tabs>
              </div>
            </div>
          </template>
          
          <!-- 基本资料 -->
          <el-form
            v-if="activeTab === 'basic'"
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-width="100px"
          >
            <el-form-item label="用户昵称" prop="nickname">
              <el-input v-model="basicForm.nickname" placeholder="请输入用户昵称" />
            </el-form-item>
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="basicForm.phone" placeholder="请输入手机号码" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="basicForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateBasicInfo">保存更新</el-button>
            </el-form-item>
          </el-form>
          
          <!-- 修改头像 -->
          <div v-else class="avatar-uploader">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="uploadAvatar"
            >
              <img v-if="avatarUrl" :src="avatarUrl" class="avatar-preview" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">
              <p>请选择JPG、PNG格式的图片，大小不超过2MB</p>
              <el-button type="primary" :disabled="!avatarChanged" @click="saveAvatar">保存头像</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      v-model="passwordDialog.visible"
      width="500px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="updatePassword">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()
const activeTab = ref('basic')
const basicFormRef = ref(null)
const passwordFormRef = ref(null)

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 当前时间
const currentTime = new Date().toLocaleString()

// 基本资料表单
const basicForm = reactive({
  nickname: '管理员',
  phone: '13800138000',
  email: 'admin@example.com'
})

// 表单验证规则
const basicRules = {
  nickname: [
    { required: true, message: '昵称不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 修改密码相关
const passwordDialog = reactive({
  visible: false
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 头像相关
const avatarUrl = ref(userStore.avatar || defaultAvatar)
const avatarChanged = ref(false)

// 显示修改密码对话框
const showUpdatePasswordDialog = () => {
  Object.assign(passwordForm, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordDialog.visible = true
}

// 更新基本信息
const updateBasicInfo = async () => {
  if (!basicFormRef.value) return
  
  try {
    await basicFormRef.value.validate()
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 更新密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    ElMessage.success('密码修改成功')
    passwordDialog.visible = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isJPG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 上传头像
const uploadAvatar = (options) => {
  const file = options.file
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    avatarUrl.value = reader.result
    avatarChanged.value = true
  }
}

// 保存头像
const saveAvatar = () => {
  if (avatarChanged.value) {
    // 实际项目中，这里应该调用API保存头像
    ElMessage.success('头像更新成功')
    avatarChanged.value = false
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  // 实际项目中，这里应该从store中获取用户信息
  Object.assign(basicForm, {
    nickname: userStore.name || '管理员',
    phone: '13800138000',
    email: 'admin@example.com'
  })
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .user-avatar {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
      
      .nickname {
        margin-top: 10px;
        font-size: 18px;
        color: var(--app-text-color);
      }
    }
    
    .user-details {
      width: 100%;
      margin-bottom: 20px;
      
      .detail-item {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        
        .label {
          width: 80px;
          color: #606266;
        }
        
        .role-tag {
          margin-right: 5px;
        }
      }
    }
    
    .user-actions {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
  
  .avatar-uploader {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    :deep(.avatar-uploader) {
      width: 200px;
      height: 200px;
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-bottom: 20px;
      overflow: hidden;
    }
    
    .avatar-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .upload-tip {
      text-align: center;
      
      p {
        color: #606266;
        margin-bottom: 10px;
      }
    }
  }
}
</style> 