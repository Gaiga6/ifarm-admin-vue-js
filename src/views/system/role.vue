<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button 
            type="primary" 
            @click="handleAdd"
            v-permission="'system:role:create'"
          >
            新增角色
          </el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="角色状态" clearable>
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
      <el-table :data="roleList" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="handleEdit(scope.row)"
              v-permission="'system:role:edit'"
            >
              编辑
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleAssignPerms(scope.row)"
              v-permission="'system:role:edit'"
            >
              权限分配
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(scope.row)"
              v-permission="'system:role:delete'"
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
      
      <!-- 角色表单对话框 -->
      <el-dialog
        :title="dialog.title"
        v-model="dialog.visible"
        width="600px"
        append-to-body
      >
        <el-form
          ref="roleFormRef"
          :model="form"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="角色编码" prop="code">
            <el-input v-model="form.code" placeholder="请输入角色编码" />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="form.sort" :min="0" :max="999" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio label="1">正常</el-radio>
              <el-radio label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" rows="3" placeholder="请输入角色描述" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </template>
      </el-dialog>
      
      <!-- 权限分配对话框 -->
      <el-dialog
        title="权限分配"
        v-model="permDialog.visible"
        width="600px"
        append-to-body
      >
        <div v-loading="permLoading">
          <el-tree
            ref="permTreeRef"
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :props="{ label: 'name' }"
            :default-checked-keys="permDialog.checkedKeys"
          />
        </div>
        <template #footer>
          <el-button @click="cancelPerm">取 消</el-button>
          <el-button type="primary" @click="submitPerms">确 定</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟角色数据
const mockRoles = [
  {
    id: 1,
    name: '超级管理员',
    code: 'ROLE_ADMIN',
    description: '拥有所有权限',
    sort: 1,
    status: '1',
    permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 2,
    name: '编辑员',
    code: 'ROLE_EDITOR',
    description: '拥有内容编辑权限',
    sort: 2,
    status: '1',
    permissions: [1, 3, 6]
  },
  {
    id: 3,
    name: '普通用户',
    code: 'ROLE_USER',
    description: '只有查看权限',
    sort: 3,
    status: '1',
    permissions: [1]
  }
]

// 模拟权限树
const mockPermissions = [
  {
    id: 1,
    name: '系统管理',
    code: 'system',
    children: [
      {
        id: 2,
        name: '用户管理',
        code: 'system:user',
        children: [
          { id: 3, name: '用户查询', code: 'system:user:list' },
          { id: 4, name: '用户创建', code: 'system:user:create' },
          { id: 5, name: '用户修改', code: 'system:user:edit' },
          { id: 6, name: '用户删除', code: 'system:user:delete' }
        ]
      },
      {
        id: 7,
        name: '角色管理',
        code: 'system:role',
        children: [
          { id: 8, name: '角色查询', code: 'system:role:list' },
          { id: 9, name: '角色创建', code: 'system:role:create' },
          { id: 10, name: '角色修改', code: 'system:role:edit' },
          { id: 11, name: '角色删除', code: 'system:role:delete' }
        ]
      }
    ]
  }
]

// 角色列表数据
const roleList = ref([])
const total = ref(0)
const loading = ref(false)
const roleFormRef = ref(null)
const permTreeRef = ref(null)

// 查询参数
const queryParams = reactive({
  name: '',
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
  name: '',
  code: '',
  sort: 0,
  status: '1',
  description: ''
})

// 权限分配对话框
const permDialog = reactive({
  visible: false,
  roleId: undefined,
  checkedKeys: []
})
const permLoading = ref(false)
const permissionTree = ref([])

// 表单验证规则
const rules = {
  name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '角色编码不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
}

// 查询角色列表
const getList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟查询和分页
    let filteredList = [...mockRoles]
    
    if (queryParams.name) {
      filteredList = filteredList.filter(item => item.name.includes(queryParams.name))
    }
    
    if (queryParams.status !== '') {
      filteredList = filteredList.filter(item => item.status === queryParams.status)
    }
    
    total.value = filteredList.length
    
    // 分页
    const startIndex = (queryParams.pageNum - 1) * queryParams.pageSize
    const endIndex = startIndex + queryParams.pageSize
    roleList.value = filteredList.slice(startIndex, endIndex)
    
    loading.value = false
  }, 300)
}

// 重置查询条件
const resetQuery = () => {
  queryParams.name = ''
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

// 新增角色
const handleAdd = () => {
  // 重置表单
  Object.assign(form, {
    id: undefined,
    name: '',
    code: '',
    sort: 0,
    status: '1',
    description: ''
  })
  
  dialog.title = '新增角色'
  dialog.visible = true
}

// 编辑角色
const handleEdit = (row) => {
  // 填充表单
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    sort: row.sort,
    status: row.status,
    description: row.description
  })
  
  dialog.title = '编辑角色'
  dialog.visible = true
}

// 删除角色
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色 ${row.name} 吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里实际应该调用API删除角色
    const index = roleList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      roleList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 分配权限
const handleAssignPerms = (row) => {
  permDialog.roleId = row.id
  permDialog.visible = true
  permLoading.value = true
  
  // 获取权限树数据
  permissionTree.value = [...mockPermissions]
  
  // 获取当前角色的权限
  const role = mockRoles.find(r => r.id === row.id)
  if (role) {
    permDialog.checkedKeys = role.permissions || []
  } else {
    permDialog.checkedKeys = []
  }
  
  permLoading.value = false
}

// 提交权限分配
const submitPerms = () => {
  const checkedKeys = permTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = permTreeRef.value.getHalfCheckedKeys()
  const allKeys = [...checkedKeys, ...halfCheckedKeys]
  
  // 模拟保存权限
  const role = mockRoles.find(r => r.id === permDialog.roleId)
  if (role) {
    role.permissions = allKeys
    ElMessage.success('权限分配成功')
    permDialog.visible = false
  }
}

// 取消权限分配
const cancelPerm = () => {
  permDialog.visible = false
}

// 表单提交
const submitForm = async () => {
  if (!roleFormRef.value) return
  
  try {
    await roleFormRef.value.validate()
    
    if (form.id) {
      // 编辑模式
      const index = mockRoles.findIndex(item => item.id === form.id)
      if (index !== -1) {
        mockRoles[index] = { ...mockRoles[index], ...form }
      }
      ElMessage.success('修改成功')
    } else {
      // 新增模式
      mockRoles.push({
        id: mockRoles.length + 1,
        ...form,
        permissions: []
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