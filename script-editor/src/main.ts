import { Component, createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElIcons from '@element-plus/icons-vue'
import App from './App.vue'

const instance = createApp(App)

instance.use(ElementPlus)

// 导入图标库
for (let name in ElIcons) {
    instance.component(name, ElIcons[name as keyof typeof ElIcons])
}

// 单独设置别名
instance.component('icon-filter', ElIcons['Filter'])
instance.component('icon-menu', ElIcons['Menu'])

instance.mount('#app')
