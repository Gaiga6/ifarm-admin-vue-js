<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button 
            type="primary" 
            @click="handleAdd"
            v-permission="'system:user:create'"
          >
            新增用户
          </el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="queryParams.userType" placeholder="用户类型" clearable>
            <el-option label="普通用户" :value="0" />
            <el-option label="农村管理员" :value="1" />
            <el-option label="平台管理员" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="用户状态" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 表格区域 -->
      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="userTypeName" label="用户类型" width="120" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="handleEdit(scope.row)"
              v-permission="'system:user:edit'"
            >
              编辑
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleResetPassword(scope.row)"
              v-permission="'system:user:edit'"
            >
              重置密码
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(scope.row)"
              v-permission="'system:user:delete'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      
      <!-- 用户表单对话框 -->
      <el-dialog
        :title="dialog.title"
        v-model="dialog.visible"
        width="600px"
        append-to-body
      >
        <el-form
          ref="userFormRef"
          :model="form"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" :disabled="form.id !== undefined" />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="form.nickname" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="密码" prop="password" v-if="!form.id">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="用户类型" prop="userType">
            <el-select v-model="form.userType" placeholder="请选择用户类型">
              <el-option label="普通用户" :value="0" />
              <el-option label="农村管理员" :value="1" />
              <el-option label="平台管理员" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio label="1">正常</el-radio>
              <el-radio label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/user'

// 用户类型映射
const USER_TYPE_NAMES = {
  0: '普通用户',
  1: '农村管理员',
  3: '平台管理员'
}

// 模拟后端数据
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    nickname: '系统管理员',
    phone: '13800138000',
    email: 'admin@example.com',
    userType: 3,
    userTypeName: '平台管理员',
    status: '1'
  },
  {
    id: 2,
    username: 'rural',
    nickname: '农村管理员',
    phone: '13800138001',
    email: 'rural@example.com',
    userType: 1,
    userTypeName: '农村管理员',
    status: '1'
  },
  {
    id: 3,
    username: 'user',
    nickname: '普通用户',
    phone: '13800138002',
    email: 'user@example.com',
    userType: 0,
    userTypeName: '普通用户',
    status: '1'
  }
]

// 用户列表数据
const userList = ref([])
const total = ref(0)
const loading = ref(false)
const userFormRef = ref(null)
const userStore = useUserStore()

// 查询参数
const queryParams = reactive({
  username: '',
  phone: '',
  userType: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

// 弹窗控制
const dialog = reactive({
  visible: false,
  title: ''
})

// 表单对象
const form = reactive({
  id: undefined,
  username: '',
  nickname: '',
  password: '',
  phone: '',
  email: '',
  userType: 0,
  status: '1'
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度必须在 3 到 20 个字符之间', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '昵称不能为空', trigger: 'blur' }],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在 6 到 20 个字符之间', trigger: 'blur' }
  ],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
}

// 查询用户列表
const getList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 这里实际环境应该调用API接口获取数据
    // 模拟查询和分页
    let filteredList = [...mockUsers]
    
    if (queryParams.username) {
      filteredList = filteredList.filter(item => item.username.includes(queryParams.username))
    }
    
    if (queryParams.phone) {
      filteredList = filteredList.filter(item => item.phone.includes(queryParams.phone))
    }
    
    if (queryParams.userType !== '') {
      filteredList = filteredList.filter(item => item.userType === queryParams.userType)
    }
    
    if (queryParams.status !== '') {
      filteredList = filteredList.filter(item => item.status === queryParams.status)
    }
    
    total.value = filteredList.length
    
    // 分页
    const startIndex = (queryParams.pageNum - 1) * queryParams.pageSize
    const endIndex = startIndex + queryParams.pageSize
    userList.value = filteredList.slice(startIndex, endIndex)
    
    loading.value = false
  }, 300)
}

// 重置查询条件
const resetQuery = () => {
  queryParams.username = ''
  queryParams.phone = ''
  queryParams.userType = ''
  queryParams.status = ''
  queryParams.pageNum = 1
  getList()
}

// 查询按钮点击
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  getList()
}

// 分页页码改变
const handleCurrentChange = (page) => {
  queryParams.pageNum = page
  getList()
}

// 新增用户
const handleAdd = () => {
  // 重置表单
  Object.assign(form, {
    id: undefined,
    username: '',
    nickname: '',
    password: '',
    phone: '',
    email: '',
    userType: 0,
    status: '1'
  })
  
  dialog.title = '新增用户'
  dialog.visible = true
}

// 编辑用户
const handleEdit = (row) => {
  // 填充表单
  Object.assign(form, {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    password: '',
    phone: row.phone,
    email: row.email,
    userType: row.userType,
    status: row.status
  })
  
  dialog.title = '编辑用户'
  dialog.visible = true
}

// 重置密码
const handleResetPassword = (row) => {
  ElMessageBox.prompt('请输入新密码', '重置密码', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputType: 'password',
    inputValidator: (value) => {
      if (!value) {
        return '密码不能为空'
      }
      if (value.length < 6 || value.length > 20) {
        return '密码长度必须在 6 到 20 个字符之间'
      }
      return true
    }
  }).then(({ value }) => {
    // 这里实际应该调用API重置密码
    ElMessage.success(`用户 ${row.username} 的密码已重置`)
  }).catch(() => {})
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里实际应该调用API删除用户
    const index = userList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      userList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 表单提交
const submitForm = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    
    // 这里实际应该调用API保存用户数据
    if (form.id) {
      // 编辑模式
      const index = mockUsers.findIndex(item => item.id === form.id)
      if (index !== -1) {
        mockUsers[index] = {
          ...mockUsers[index],
          ...form,
          userTypeName: USER_TYPE_NAMES[form.userType]
        }
      }
      ElMessage.success('修改成功')
    } else {
      // 新增模式
      mockUsers.push({
        id: mockUsers.length + 1,
        ...form,
        userTypeName: USER_TYPE_NAMES[form.userType]
      })
      ElMessage.success('新增成功')
    }
    
    dialog.visible = false
    getList()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消按钮
const cancel = () => {
  dialog.visible = false
}

// 组件挂载时获取数据
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 10px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .search-form {
    margin-bottom: 20px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style> 