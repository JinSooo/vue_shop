import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home" */ '../components/Login.vue')

// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home" */ '../components/Home.vue')

// import Users from '../components/User/Users.vue'
// import Rights from '../components/Rights/Rights.vue'
// import Roles from '../components/Rights/Roles.vue'
const Users = () => import(/* webpackChunkName: "user_right" */ '../components/User/Users.vue')
const Rights = () => import(/* webpackChunkName: "user_right" */ '../components/Rights/Rights.vue')
const Roles = () => import(/* webpackChunkName: "user_right" */ '../components/Rights/Roles.vue')

// import Categories from '../components/Goods/Categories.vue'
// import Params from '../components/Goods/Params.vue'
const Categories = () => import(/* webpackChunkName: "cate_params" */ '../components/Goods/Categories.vue')
const Params = () => import(/* webpackChunkName: "cate_params" */ '../components/Goods/Params.vue')

// import List from '../components/Goods/List.vue'
// import Add from '../components/Goods/Add.vue'
const List = () => import(/* webpackChunkName: "list_add" */ '../components/Goods/List.vue')
const Add = () => import(/* webpackChunkName: "list_add" */ '../components/Goods/Add.vue')

// import Orders from '../components/Orders/Orders.vue'
const Orders = () => import(/* webpackChunkName: "order" */ '../components/Orders/Orders.vue')

// import Report from '../components/Report/Report.vue'
const Report = () => import(/* webpackChunkName: "report" */ '../components/Report/Report.vue')

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
      },
      {
        path: '/reports',
        component: Report
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
