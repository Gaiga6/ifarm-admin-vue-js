import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // 当前主题色
    primaryColor: '#409EFF',
    // 是否为暗色主题
    isDark: false,
    // 预设主题色列表
    colorList: [
      { name: '拂晓蓝', value: '#409EFF' },
      { name: '薄暮红', value: '#F56C6C' },
      { name: '火山灰', value: '#909399' },
      { name: '极光绿', value: '#67C23A' },
      { name: '日暮黄', value: '#E6A23C' },
      { name: '酱紫色', value: '#9C27B0' }
    ]
  }),

  actions: {
    // 设置主题色
    setPrimaryColor(color) {
      this.primaryColor = color
      this.updateThemeColor(color)
    },

    // 切换暗黑模式
    toggleDarkMode() {
      this.isDark = !this.isDark
      document.documentElement.classList.toggle('dark', this.isDark)
      this.updateThemeColor(this.primaryColor)
    },

    // 更新主题色（修改CSS变量）
    updateThemeColor(color) {
      // 获取CSS根节点
      const root = document.documentElement

      // 修改Element Plus主题色变量
      // 主色
      root.style.setProperty('--el-color-primary', color)
      
      // 不同程度的主色
      for (let i = 1; i <= 9; i++) {
        // 生成不同明度的颜色
        const lightColor = this.lighten(color, i * 10)
        root.style.setProperty(`--el-color-primary-light-${i}`, lightColor)
      }
      
      // 主色的暗色版本
      const darkColor = this.darken(color, 10)
      root.style.setProperty('--el-color-primary-dark-2', darkColor)

      // 保存到本地存储
      localStorage.setItem('theme-color', color)
      localStorage.setItem('theme-dark', this.isDark ? 'true' : 'false')
    },

    // 从本地存储加载主题设置
    loadThemeSettings() {
      const savedColor = localStorage.getItem('theme-color')
      const savedDarkMode = localStorage.getItem('theme-dark') === 'true'

      if (savedColor) {
        this.primaryColor = savedColor
      }

      this.isDark = savedDarkMode
      document.documentElement.classList.toggle('dark', this.isDark)
      this.updateThemeColor(this.primaryColor)
    },

    // 将颜色变浅的函数
    lighten(color, amount) {
      const hex = color.replace('#', '')
      let r = parseInt(hex.substring(0, 2), 16)
      let g = parseInt(hex.substring(2, 4), 16)
      let b = parseInt(hex.substring(4, 6), 16)

      r = Math.min(255, r + (amount * 2.55))
      g = Math.min(255, g + (amount * 2.55))
      b = Math.min(255, b + (amount * 2.55))
      
      return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
    },

    // 将颜色变深的函数
    darken(color, amount) {
      const hex = color.replace('#', '')
      let r = parseInt(hex.substring(0, 2), 16)
      let g = parseInt(hex.substring(2, 4), 16)
      let b = parseInt(hex.substring(4, 6), 16)

      r = Math.max(0, r - (amount * 2.55))
      g = Math.max(0, g - (amount * 2.55))
      b = Math.max(0, b - (amount * 2.55))
      
      return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
    }
  }
}) 