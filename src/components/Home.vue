<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/favicon.png" alt="" />
        <span>电商管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="collapseWidth">
        <!-- 按钮条 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :collapse="isCollapse"
          :collapse-transition="false"
          unique-opened
          router
          :default-active="brightMenu"
        >
          <!-- 一级菜单 -->
          <el-submenu v-for="menu in menuList" :key="menu.id" :index="menu.id + ''">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconList[menu.id]"></i>
              <!-- 文本 -->
              <span>{{ menu.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              v-for="subMenu in menu.children"
              :key="subMenu.id"
              :index="'/' + subMenu.path"
              @click="saveBrightMenu('/' + subMenu.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subMenu.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 菜单列表
      menuList: [],
      // 菜单相对应的图标列表
      iconList: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 折叠的长度
      collapseWidth: '200px',
      // 默认高亮的菜单
      brightMenu: window.sessionStorage.getItem('brightMenu') || ''
    }
  },
  mounted () {
    this.getAsideMenu()
  },
  methods: {
    // 注销用户
    logout () {
      // 清空session
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    },
    // 获取左侧菜单
    async getAsideMenu () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 实现左侧菜单的缩小和展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
      this.collapseWidth = this.isCollapse ? '64px' : '200px'
    },
    // 保存当前高亮的菜单
    saveBrightMenu (brightMenu) {
      window.sessionStorage.setItem('brightMenu', brightMenu)
      this.brightMenu = brightMenu
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 30px;
  color: rgb(238, 236, 236);
  font-size: 20px;
  font-weight: bold;
  font-family: '楷体';
  > div {
    display: flex;
    align-items: center;
    img {
      width: 50px;
      height: 50px;
      margin-right: 10px;
    }
  }
}

.el-aside {
  background-color: #333744;
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
