import permissionDirective from './permission'

export default {
  install(app) {
    // 注册权限指令
    app.use(permissionDirective)
    
    // 可以在此处注册更多自定义指令
  }
} 