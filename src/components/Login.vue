<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar-box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        label-width="0px"
        class="login-form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            type="password"
            v-model="loginForm.password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btn-box">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 登录表单的数据对象
      loginForm: {
        username: '',
        password: ''
      },
      // 登录表单的验证规则对象
      loginFormRules: {
        username: [
          {
            required: true,
            message: '请输入登录用户名',
            trigger: 'blur'
          },
          {
            required: true,
            min: 3,
            max: 5,
            message: '长度在 3 到 5 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入登录密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '长度应该在 6 到 15 位之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    resetLoginForm () {
      // 获取表单实例
      const loginFormRef = this.$refs.loginFormRef
      // resetFields 重置表单数据
      loginFormRef.resetFields()
      // model双向绑定所以要清除
      this.username = ''
      this.password = ''
    },
    login () {
      // 获取表单实例
      const loginFormRef = this.$refs.loginFormRef
      // validate 预验证
      loginFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请检测输入是否正确')

        // 发送ajax
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')

        // 登录成功 保存token
        window.sessionStorage.setItem('token', res.data.token)
        // 编程式改变路由地址
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: #2b4b6b;
}

.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.avatar-box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  background-color: #fff;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  img {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background-color: #eee;
  }
}

.login-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btn-box {
  display: flex;
  justify-content: flex-end;
}
</style>
