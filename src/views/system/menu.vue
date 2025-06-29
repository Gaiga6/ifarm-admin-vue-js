<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button 
            type="primary" 
            @click="handleAdd"
            v-permission="'system:menu:create'"
          >
            新增菜单
          </el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入菜单名称" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="菜单状态" clearable>
            <el-option label="显示" value="1" />
            <el-option label="隐藏" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 表格区域 -->
      <el-table
        :data="menuList"
        style="width: 100%"
        v-loading="loading"
        row-key="id"
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="name" label="菜单名称" width="180" />
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="scope">
            <el-icon v-if="scope.row.icon">
              <component :is="scope.row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="path" label="路由地址" />
        <el-table-column prop="component" label="组件路径" />
        <el-table-column prop="permission" label="权限标识" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'M'">目录</el-tag>
            <el-tag v-else-if="scope.row.type === 'C'" type="success">菜单</el-tag>
            <el-tag v-else-if="scope.row.type === 'F'" type="info">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === '1' ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="handleAdd(scope.row)"
              v-permission="'system:menu:create'"
            >
              新增
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleEdit(scope.row)"
              v-permission="'system:menu:edit'"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(scope.row)"
              v-permission="'system:menu:delete'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 菜单表单对话框 -->
      <el-dialog
        :title="dialog.title"
        v-model="dialog.visible"
        width="700px"
        append-to-body
      >
        <el-form
          ref="menuFormRef"
          :model="form"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="上级菜单" prop="parentId">
            <el-tree-select
              v-model="form.parentId"
              :data="menuOptions"
              :props="{ label: 'name', value: 'id' }"
              value-key="id"
              placeholder="请选择上级菜单"
              check-strictly
              :render-after-expand="false"
            />
          </el-form-item>
          <el-form-item label="菜单类型" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio label="M">目录</el-radio>
              <el-radio label="C">菜单</el-radio>
              <el-radio label="F">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入菜单名称" />
          </el-form-item>
          <el-form-item label="图标" prop="icon" v-if="form.type !== 'F'">
            <el-input v-model="form.icon" placeholder="请选择图标" />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="form.sort" :min="0" :max="999" />
          </el-form-item>
          <el-form-item label="路由地址" prop="path" v-if="form.type !== 'F'">
            <el-input v-model="form.path" placeholder="请输入路由地址" />
          </el-form-item>
          <el-form-item label="组件路径" prop="component" v-if="form.type === 'C'">
            <el-input v-model="form.component" placeholder="请输入组件路径" />
          </el-form-item>
          <el-form-item label="路由参数" prop="query" v-if="form.type === 'C'">
            <el-input v-model="form.query" placeholder="请输入路由参数(可空)" />
          </el-form-item>
          <el-form-item label="权限标识" prop="permission" v-if="form.type !== 'M'">
            <el-input v-model="form.permission" placeholder="请输入权限标识" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio label="1">显示</el-radio>
              <el-radio label="0">隐藏</el-radio>
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

// 模拟菜单数据
const mockMenus = [
  {
    id: 1,
    parentId: 0,
    name: '系统管理',
    icon: 'Setting',
    path: '/system',
    component: null,
    sort: 1,
    type: 'M',
    permission: '',
    status: '1',
    children: [
      {
        id: 2,
        parentId: 1,
        name: '用户管理',
        icon: 'User',
        path: 'user',
        component: 'system/user',
        sort: 1,
        type: 'C',
        permission: 'system:user:list',
        status: '1',
        children: [
          {
            id: 6,
            parentId: 2,
            name: '用户新增',
            icon: '',
            path: '',
            component: '',
            sort: 1,
            type: 'F',
            permission: 'system:user:create',
            status: '1'
          },
          {
            id: 7,
            parentId: 2,
            name: '用户修改',
            icon: '',
            path: '',
            component: '',
            sort: 2,
            type: 'F',
            permission: 'system:user:edit',
            status: '1'
          },
          {
            id: 8,
            parentId: 2,
            name: '用户删除',
            icon: '',
            path: '',
            component: '',
            sort: 3,
            type: 'F',
            permission: 'system:user:delete',
            status: '1'
          }
        ]
      },
      {
        id: 3,
        parentId: 1,
        name: '角色管理',
        icon: 'Lock',
        path: 'role',
        component: 'system/role',
        sort: 2,
        type: 'C',
        permission: 'system:role:list',
        status: '1',
        children: [
          {
            id: 9,
            parentId: 3,
            name: '角色新增',
            icon: '',
            path: '',
            component: '',
            sort: 1,
            type: 'F',
            permission: 'system:role:create',
            status: '1'
          },
          {
            id: 10,
            parentId: 3,
            name: '角色修改',
            icon: '',
            path: '',
            component: '',
            sort: 2,
            type: 'F',
            permission: 'system:role:edit',
            status: '1'
          },
          {
            id: 11,
            parentId: 3,
            name: '角色删除',
            icon: '',
            path: '',
            component: '',
            sort: 3,
            type: 'F',
            permission: 'system:role:delete',
            status: '1'
          }
        ]
      },
      {
        id: 4,
        parentId: 1,
        name: '菜单管理',
        icon: 'Menu',
        path: 'menu',
        component: 'system/menu',
        sort: 3,
        type: 'C',
        permission: 'system:menu:list',
        status: '1',
        children: [
          {
            id: 12,
            parentId: 4,
            name: '菜单新增',
            icon: '',
            path: '',
            component: '',
            sort: 1,
            type: 'F',
            permission: 'system:menu:create',
            status: '1'
          },
          {
            id: 13,
            parentId: 4,
            name: '菜单修改',
            icon: '',
            path: '',
            component: '',
            sort: 2,
            type: 'F',
            permission: 'system:menu:edit',
            status: '1'
          },
          {
            id: 14,
            parentId: 4,
            name: '菜单删除',
            icon: '',
            path: '',
            component: '',
            sort: 3,
            type: 'F',
            permission: 'system:menu:delete',
            status: '1'
          }
        ]
      }
    ]
  },
  {
    id: 5,
    parentId: 0,
    name: '系统监控',
    icon: 'Monitor',
    path: '/monitor',
    component: null,
    sort: 2,
    type: 'M',
    permission: '',
    status: '1',
    children: []
  }
]

// 菜单列表数据
const menuList = ref([])
const loading = ref(false)
const menuFormRef = ref(null)

// 复制原始数据，以便后续操作
let clonedMenus = JSON.parse(JSON.stringify(mockMenus))

// 菜单选项，用于上级菜单下拉选择
const menuOptions = ref([
  {
    id: 0,
    name: '主目录',
    children: []
  }
])

// 查询参数
const queryParams = reactive({
  name: '',
  status: ''
})

// 弹窗控制
const dialog = reactive({
  visible: false,
  title: ''
})

// 表单对象
const form = reactive({
  id: undefined,
  parentId: 0,
  name: '',
  icon: '',
  path: '',
  component: '',
  query: '',
  sort: 0,
  type: 'M',
  permission: '',
  status: '1'
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
}

// 查询菜单列表
const getList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    let filteredList = JSON.parse(JSON.stringify(clonedMenus))
    
    // 如果有查询参数，则进行过滤
    if (queryParams.name || queryParams.status !== '') {
      // 实现一个递归过滤函数
      const filterNode = (nodes, name, status) => {
        return nodes.filter(node => {
          // 检查当前节点是否符合条件
          let match = true
          if (name && !node.name.includes(name)) {
            match = false
          }
          if (status !== '' && node.status !== status) {
            match = false
          }
          
          // 处理子节点
          if (node.children && node.children.length > 0) {
            const filteredChildren = filterNode(node.children, name, status)
            if (filteredChildren.length > 0) {
              node.children = filteredChildren
              match = true  // 如果子节点符合条件，那么父节点也应该显示
            } else {
              node.children = []
            }
          }
          
          return match
        })
      }
      
      // 应用过滤
      filteredList = filterNode(filteredList, queryParams.name, queryParams.status)
    }
    
    menuList.value = filteredList
    loading.value = false
  }, 300)
}

// 获取菜单选项（用于上级菜单选择）
const getMenuOptions = () => {
  const options = [{ id: 0, name: '主目录', children: [] }]
  const buildOptions = (menus) => {
    // 递归过滤，只保留目录和菜单类型的选项，不包含按钮
    menus.forEach(item => {
      if (item.type !== 'F') {
        const option = {
          id: item.id,
          name: item.name,
          children: []
        }
        // 如果有子菜单，递归处理
        if (item.children && item.children.length > 0) {
          buildOptions(item.children)
        }
        options.push(option)
      }
    })
  }
  
  buildOptions(clonedMenus)
  menuOptions.value = options
}

// 重置查询条件
const resetQuery = () => {
  queryParams.name = ''
  queryParams.status = ''
  getList()
}

// 查询按钮点击
const handleQuery = () => {
  getList()
}

// 新增菜单
const handleAdd = (row) => {
  // 重置表单
  Object.assign(form, {
    id: undefined,
    parentId: row ? row.id : 0,
    name: '',
    icon: '',
    path: '',
    component: '',
    query: '',
    sort: 0,
    type: 'M',
    permission: '',
    status: '1'
  })
  
  dialog.title = '新增菜单'
  dialog.visible = true
}

// 编辑菜单
const handleEdit = (row) => {
  // 填充表单
  Object.assign(form, {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    icon: row.icon,
    path: row.path,
    component: row.component,
    query: row.query || '',
    sort: row.sort,
    type: row.type,
    permission: row.permission,
    status: row.status
  })
  
  dialog.title = '编辑菜单'
  dialog.visible = true
}

// 递归查找菜单节点
const findMenuNode = (menus, id, parentNode = null, index = -1) => {
  for (let i = 0; i < menus.length; i++) {
    const item = menus[i]
    if (item.id === id) {
      return { node: item, parent: parentNode, index: i }
    }
    if (item.children && item.children.length > 0) {
      const result = findMenuNode(item.children, id, item, i)
      if (result.node) {
        return result
      }
    }
  }
  return { node: null, parent: null, index: -1 }
}

// 删除菜单
const handleDelete = (row) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('该菜单存在子菜单，不能删除')
    return
  }
  
  ElMessageBox.confirm(`确定要删除菜单 ${row.name} 吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 在菜单树中查找并删除节点
    const { node, parent, index } = findMenuNode(clonedMenus, row.id)
    if (node) {
      if (parent) {
        parent.children.splice(index, 1)
      } else {
        // 顶层菜单
        clonedMenus.splice(index, 1)
      }
      ElMessage.success('删除成功')
      getList()
    }
  }).catch(() => {})
}

// 表单提交
const submitForm = async () => {
  if (!menuFormRef.value) return
  
  try {
    await menuFormRef.value.validate()
    
    if (form.id) {
      // 编辑模式
      const { node } = findMenuNode(clonedMenus, form.id)
      if (node) {
        Object.assign(node, { ...form })
        ElMessage.success('修改成功')
      }
    } else {
      // 新增模式
      const newMenu = {
        ...form,
        id: Date.now(), // 模拟生成ID
        children: form.type !== 'F' ? [] : undefined // 只有目录和菜单需要children字段
      }
      
      // 添加到父菜单
      if (form.parentId === 0) {
        clonedMenus.push(newMenu)
      } else {
        const { node } = findMenuNode(clonedMenus, form.parentId)
        if (node) {
          if (!node.children) {
            node.children = []
          }
          node.children.push(newMenu)
        }
      }
      ElMessage.success('新增成功')
    }
    
    dialog.visible = false
    getList()
    getMenuOptions()
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
  getMenuOptions()
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
}
</style> 