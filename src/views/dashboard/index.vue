<template>
  <div class="dashboard-container">
    <!-- 概览卡片 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-for="(card, index) in cards" :key="index">
        <el-card :body-style="{ padding: '20px' }" class="mb-3">
          <div class="card-content">
            <div>
              <h3 class="card-title">{{ card.title }}</h3>
              <div class="card-value">{{ card.value }}</div>
            </div>
            <el-icon :size="48" :style="{ color: themeStore.primaryColor }">
              <component :is="card.icon" />
            </el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表 -->
    <el-row :gutter="20" class="mb-3">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>访问分析</span>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder" :style="{ borderColor: themeStore.primaryColor }">
              <span>图表区域 (访问统计)</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>销售统计</span>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder" :style="{ borderColor: themeStore.primaryColor }">
              <span>图表区域 (销售数据)</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 表格数据 -->
    <el-card class="mb-3">
      <template #header>
        <div class="table-header flex-between">
          <div>最近订单</div>
          <el-button type="primary">查看全部</el-button>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="订单号" width="120" />
        <el-table-column prop="customer" label="客户" width="120" />
        <el-table-column prop="date" label="日期" width="160" />
        <el-table-column prop="amount" label="金额" width="120" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default>
            <el-button link type="primary" size="small">查看</el-button>
            <el-button link type="primary" size="small">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useThemeStore } from '../../store/theme'
import { Monitor, ShoppingCart, User, Money } from '@element-plus/icons-vue'

const themeStore = useThemeStore()

// 概览卡片数据
const cards = [
  { title: '总访问量', value: '8,846', icon: 'Monitor' },
  { title: '订单数', value: '1,286', icon: 'ShoppingCart' },
  { title: '用户总数', value: '3,862', icon: 'User' },
  { title: '总收入', value: '¥ 21,389', icon: 'Money' }
]

// 表格数据
const tableData = [
  {
    id: 'ORD-2001',
    customer: '张三',
    date: '2023-06-01 10:21:32',
    amount: '¥ 1,200',
    status: '已完成'
  },
  {
    id: 'ORD-2002',
    customer: '李四',
    date: '2023-06-01 11:10:45',
    amount: '¥ 890',
    status: '处理中'
  },
  {
    id: 'ORD-2003',
    customer: '王五',
    date: '2023-06-02 08:30:12',
    amount: '¥ 2,600',
    status: '已发货'
  },
  {
    id: 'ORD-2004',
    customer: '赵六',
    date: '2023-06-03 16:24:58',
    amount: '¥ 1,020',
    status: '已取消'
  }
]

// 获取状态标签类型
const getStatusType = (status) => {
  const statusMap = {
    '已完成': 'success',
    '处理中': 'warning',
    '已发货': 'info',
    '已取消': 'danger'
  }
  return statusMap[status] || 'info'
}

// 组件挂载时加载主题设置
onMounted(() => {
  themeStore.loadThemeSettings()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  .card-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .card-title {
      font-size: 16px;
      color: var(--app-text-color);
      opacity: 0.8;
      margin-bottom: 8px;
    }
    
    .card-value {
      font-size: 24px;
      font-weight: bold;
      color: var(--app-text-color);
    }
  }
  
  .chart-container {
    height: 300px;
    
    .chart-placeholder {
      height: 100%;
      border: 2px dashed;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.5;
    }
  }
  
  .mb-3 {
    margin-bottom: 20px;
  }
  
  .table-header {
    font-weight: bold;
  }
}
</style>