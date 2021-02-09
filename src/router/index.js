import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

import Users from '../components/User/Users.vue'

import Rights from '../components/Rights/Rights.vue'
import Roles from '../components/Rights/Roles.vue'

import Categories from '../components/Goods/Categories.vue'
import Params from '../components/Goods/Params.vue'
import List from '../components/Goods/List.vue'
import Add from '../components/Goods/Add.vue'

import Orders from '../components/Orders/Orders.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    children: [
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: List
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/orders',
        component: Orders
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

/**
 * 挂载路由导航守卫
 *
 * to 将要访问的路径
 * from 代表从哪个路径而来
 * next 函数 表示放行
 *    next() 放行 next('/login') 强制跳转到/login
 */
router.beforeEach((to, from, next) => {
  // 判断路径
  if (to.path === '/login') return next()
  // 获取token
  const token = window.sessionStorage.getItem('token')
  // 如果没用token则强制跳回login
  if (!token) return next('/login')
  next()
})

export default router
