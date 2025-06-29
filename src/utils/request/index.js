import axios from 'axios'
import { ElMessage } from 'element-plus'

// 调试日志函数
const logDebug = (message, data) => {
  console.log(`%c[API请求] ${message}`, 'color: #409EFF; background: #ecf5ff; padding: 2px 4px; border-radius: 2px;', data || '')
}

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // API基础路径
  timeout: 10000, // 请求超时时间
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求前做些什么
    logDebug('发起请求', { 
      url: config.url, 
      method: config.method, 
      params: config.params,
      data: config.data
    })
    
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      // 让每个请求携带token
      config.headers['Authorization'] = `Bearer ${token}`
      logDebug('请求携带Token', token)
    }
    
    return config
  },
  error => {
    // 处理请求错误
    logDebug('请求错误', error)
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 处理响应数据
    const res = response.data
    
    logDebug('收到响应', { 
      url: response.config.url, 
      status: response.status,
      data: res
    })
    
    // 如果响应码不是200，认为请求有错误
    if (response.status !== 200) {
      ElMessage({
        message: res.message || '请求错误',
        type: 'error',
        duration: 5 * 1000
      })
      
      logDebug('响应状态码错误', response.status)
      
      // 处理特定错误码，例如401未授权
      if (response.status === 401) {
        logDebug('未授权，需要重新登录')
        // 可以在这里处理登出逻辑
      }
      
      return Promise.reject(new Error(res.message || '请求错误'))
    } else {
      return res
    }
  },
  error => {
    // 处理响应错误
    logDebug('响应错误', { 
      url: error.config?.url,
      message: error.message,
      response: error.response
    })
    
    let message = '连接服务器失败'
    
    if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
        case 400:
          message = '请求错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 可以在这里处理登出逻辑
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求失败: ${error.response.status}`
      }
      
      logDebug('HTTP错误', { status: error.response.status, message })
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message = '服务器无响应'
      logDebug('无响应', error.request)
    } else {
      // 请求配置出错
      message = '请求配置错误'
      logDebug('请求配置错误', error.message)
    }
    
    ElMessage({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
    
    return Promise.reject(error)
  }
)

export default service 