import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 字体样式
import './assets/fonts/iconfont.css'
// 全局样式
import './assets/css/global.css'

import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import axios from 'axios'
// 配置axios默认根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // 每次请求时传入token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)

// 过滤器
Vue.filter('dateFormat', function(ms) {
  const date = new Date(ms)
  return `${date.getFullYear()}-${(date.getMonth() + 1 + '').padStart(2, '0')}-${(date.getDate() + '').padStart(2, '0')} ${(date.getHours() + '').padStart(2, '0')}:${(date.getMinutes() + 1 + '').padStart(2, '0')}:${(date.getSeconds() + '').padStart(2, '0')}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
