<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索与添加区域 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="isAddDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="username" label="姓名" width="180"> </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <!-- {{ scope.row }} -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" @click="showEditUserDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" @click="deleteUser(scope.row)"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" @click="showSetRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加用户的对话框 -->
      <el-dialog title="添加用户" :visible.sync="isAddDialogVisible" width="30%" @close="addDialogClosed">
        <!-- 内容主题区域 -->
        <el-form :model="addUserForm" :rules="userFormRules" ref="addUserFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUserForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isAddDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户的对话框 -->
      <el-dialog title="修改用户信息" :visible.sync="isEditDialogVisible" width="30%" @close="editDialogClosed">
        <!-- 内容主题区域 -->
        <el-form :model="editUserForm" :rules="userFormRules" ref="editUserFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editUserForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isEditDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色的对话框 -->
      <el-dialog title="分配角色" :visible.sync="isSetRoleDialogVisible" width="30%" @close="setRoleDialogClosed">
        <!-- 内容主题区域 -->
        <div>
          <p>当前的用户: {{ setRoleForm.username }}</p>
          <p>当前的角色: {{ setRoleForm.role_name }}</p>
          <div>
            要选择的新角色:
            <el-select v-model="selectedNewRole" placeholder="请选择">
              <el-option v-for="role in rolesList" :key="role.id" :label="role.roleName" :value="role.id"> </el-option>
            </el-select>
          </div>
        </div>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isSetRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setUserRole">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义校验规则
    // 邮箱
    const checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-]+)@([a-zA-Z0-9_-]+)(\.[a-zA-Z0-9_-]+)$/
      if (regEmail.test(value)) return cb()
      cb(new Error('请输入合法的邮箱'))
    }
    const checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) return cb()
      cb(new Error('请输入合法的手机号'))
    }
    // 手机号
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 一页显示的数量
        pagesize: 2
      },
      // 用户信息
      userList: [],
      // 用户总人数
      total: 0,
      /**
       * 添加用户
       */
      // 控制添加用户对话框的显示和隐藏
      isAddDialogVisible: false,
      // 添加用户表单的数据对象
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 用户表单的验证规则对象
      userFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入用户密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '长度应该在 6 到 15 位之间',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      /**
       * 修改用户
       */
      // 控制修改用户对话框的显示和隐藏
      isEditDialogVisible: false,
      // 修改用户表单的数据对象
      editUserForm: {
        username: '',
        email: '',
        mobile: ''
      },
      /**
       * 分配角色
       */
      // 控制分配角色对话框的显示和隐藏
      isSetRoleDialogVisible: false,
      // 分配角色表单的数据对象
      setRoleForm: {},
      rolesList: [],
      // 选中的新角色
      selectedNewRole: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 获取用户列表 ajax
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 修改用户状态
    async userStateChanged(userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('设置状态成功')
    },
    // 监听添加用户对话框的关闭
    addDialogClosed() {
      this.$refs.addUserFormRef.resetFields()
    },
    // 监听修改用户对话框的关闭
    editDialogClosed() {
      this.$refs.editUserFormRef.resetFields()
    },
    // 监听修改用户对话框的关闭
    setRoleDialogClosed() {
      this.selectedNewRole = ''
      this.setRoleForm = ''
    },
    // 添加用户功能
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        // 隐藏对话框
        this.isAddDialogVisible = false
        // 刷新数据
        this.getUserList()
      })
    },
    // 修改用户功能
    editUser() {
      this.$refs.editUserFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editUserForm.id, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile
        })
        if (res.meta.status !== 200) return this.$message.error('修改用户失败')
        this.$message.success('修改用户成功')
        // 隐藏对话框
        this.isEditDialogVisible = false
        // 刷新数据
        this.getUserList()
      })
    },
    // 删除用户功能
    async deleteUser(userInfo) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户: ' + userInfo.username + ' , 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('users/' + userInfo.id)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getUserList()
      } else if (confirmResult === 'cancel') {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
    },
    // 显示修改用户信息对话框
    async showEditUserDialog(userId) {
      const { data: res } = await this.$http.get('users/' + userId)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败')
      this.editUserForm = res.data
      this.isEditDialogVisible = true
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 设置分配角色
    async showSetRole(userInfo) {
      this.setRoleForm = userInfo

      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data

      this.isSetRoleDialogVisible = true
    },
    async setUserRole() {
      if (!this.selectedNewRole) return this.$message.error('请选中一个新的角色')
      const { data: res } = await this.$http.put(`users/${this.setRoleForm.id}/role`, { rid: this.selectedNewRole })
      if (res.meta.status !== 200) return this.$message.error('设置用户角色失败')
      this.$message.success('设置用户角色成功')
      this.getUserList()
      this.isSetRoleDialogVisible = false
    }
  }
}
</script>

<style></style>
