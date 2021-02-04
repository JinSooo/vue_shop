<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 添加角色按钮 -->
      <el-button type="primary" @click="isAddRoleDialogVisible = true">添加角色</el-button>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 !== 0 ? 'bdtop' : '', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag type="success" closable @close="deleteRightById(scope.row, item2.id)">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="deleteRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column prop="level" label="操作" width="400px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="showRoleDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" @click="showRightsDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog title="提示" :visible.sync="isRightsDialogVisible" width="30%">
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defaultKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加用角色" :visible.sync="isAddRoleDialogVisible" width="30%" @close="addRoleDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="addRoleForm" :rules="roleFormRules" ref="addRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="isAddRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色信息" :visible.sync="isEditRoleDialogVisible" width="30%" @close="editRoleDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="editRoleForm" :rules="roleFormRules" ref="editRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="isEditRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 显示分配权限对话框
      isRightsDialogVisible: false,
      // 所以权限的数据
      rightsList: [],
      // 树形控件的绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点Id值
      defaultKeys: [],
      // 打开对话框相对应的角色
      role: '',
      // 控制添加角色对话框的显示和隐藏
      isAddRoleDialogVisible: false,
      // 添加用户表单的数据对象
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 角色表单的验证规则对象
      roleFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入用户描述',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 20,
            message: '长度应该在 2 到 20 位之间',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改角色对话框的显示和隐藏
      isEditRoleDialogVisible: false,
      // 修改角色表单的数据对象
      editRoleForm: {}
    }
  },
  mounted() {
    this.getRolesList()
  },
  methods: {
    // 获取权限列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.rolesList = res.data
    },
    // 通过id删除权限
    async deleteRightById(roles, rightsId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限 , 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('roles/' + roles.id + '/rights/' + rightsId)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        roles.children = res.data
      } else if (confirmResult === 'cancel') {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
    },
    // 显示分配权限对话框
    async showRightsDialog(role) {
      this.role = role
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败')
      this.rightsList = res.data
      this.defaultKeys = []
      this.getDefaultKeys(role, this.defaultKeys)
      this.isRightsDialogVisible = true
    },
    // 获取用户权限的id
    getDefaultKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getDefaultKeys(item, arr)
      })
    },
    // 保存分配权限对话框角色的权限
    async saveRoleRights() {
      // 获取所有权限中选中的权限
      const checkedRightsArr = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const checkedRightsStr = checkedRightsArr.join(',')
      const { data: res } = await this.$http.post('roles/' + this.role.id + '/rights', {
        rids: checkedRightsStr
      })
      if (res.meta.status !== 200) return this.$message.error('设置角色权限数据失败')
      this.$message.success('设置角色权限数据成功')
      this.getRolesList()
      this.isRightsDialogVisible = false
    },
    // 添加角色功能
    addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        // 隐藏对话框
        this.isAddRoleDialogVisible = false
        // 刷新数据
        this.getRolesList()
      })
    },
    // 显示分配权限对话框
    async showRoleDialog(roleId) {
      const { data: res } = await this.$http.get('roles/' + roleId)
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败')
      this.editRoleForm = res.data
      this.isEditRoleDialogVisible = true
    },
    // 修改用户功能
    editRole() {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('修改角色失败')
        this.$message.success('修改角色成功')
        // 隐藏对话框
        this.isEditRoleDialogVisible = false
        // 刷新数据
        this.getRolesList()
      })
    },
    // 删除用户功能
    async deleteRole(roleId) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('roles/' + roleId)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getRolesList()
      } else if (confirmResult === 'cancel') {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
    },
    // 添加角色对话框关闭
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 10px;
}
.vcenter {
  display: flex;
  align-items: center;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>
