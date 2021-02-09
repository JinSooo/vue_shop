<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 警告 -->
      <el-alert title="注意: 只允许为第三级分类设置相关参数!" type="warning" show-icon :closable="false"> </el-alert>
      <!-- 添加商品分类按钮 -->
      <div class="select">
        选择商品分类:
        <!-- 级联选择器 -->
        <el-cascader
          v-model="selectedCategory"
          :options="categoriesList"
          :props="cascaderProps"
          @change="handleChange"
          clearable
          ref="cascaderRef"
        ></el-cascader>
      </div>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 动态参数 -->
          <!-- 添加参数按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled" @click="isParamsDialogVisible = true">添加参数</el-button>
          <!-- 动态参数列表区域 -->
          <el-table :data="manyParams" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag :key="i" v-for="(val, i) in scope.row.attr_vals" closable @close="handleClose(scope.row, i)">
                  {{ val }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.tagInputVisible"
                  v-model="scope.row.tagInputValue"
                  ref="tagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
            <el-table-column label="操作" width="400px">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 静态属性 -->
          <!-- 添加属性按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled" @click="isParamsDialogVisible = true">添加属性</el-button>
          <!-- 静态属性列表区域 -->
          <el-table :data="onlyParams" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag :key="i" v-for="(val, i) in scope.row.attr_vals" closable @close="handleClose(scope.row, i)">
                  {{ val }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.tagInputVisible"
                  v-model="scope.row.tagInputValue"
                  ref="tagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
            <el-table-column label="操作" width="400px">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数对话框 -->
      <el-dialog
        :title="'添加' + dialogText"
        :visible.sync="isParamsDialogVisible"
        width="30%"
        @close="paramsDialogClosed"
      >
        <!-- 内容主题区域 -->
        <el-form :model="addParamsForm" :rules="paramsFormRules" ref="addParamsFormRef" label-width="80px">
          <el-form-item :label="dialogText" prop="attr_name">
            <el-input v-model="addParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isParamsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogSubmit">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改参数对话框 -->
      <el-dialog
        :title="'修改' + dialogText"
        :visible.sync="isEditParamsDialogVisible"
        width="30%"
        @close="editParamsDialogClosed"
      >
        <!-- 内容主题区域 -->
        <el-form :model="editParamsForm" :rules="paramsFormRules" ref="editParamsFormRef" label-width="80px">
          <el-form-item :label="dialogText" prop="attr_name">
            <el-input v-model="editParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isEditParamsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogEditSubmit">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类的数据列表
      categoriesList: [],
      // 选择的商品分类
      selectedCategory: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选择的商品分类相对应的动态参数信息
      manyParams: [],
      // 选择的商品分类相对应的静态属性信息
      onlyParams: [],
      // 分类参数的请求参数对象
      paramsInfo: {
        id: 0,
        sel: 'many'
      },
      // 默认激活的标签页
      activeName: 'many',
      // 参数对话框的显示隐藏
      isParamsDialogVisible: false,
      addParamsForm: {
        attr_name: ''
      },
      // 表单的验证规则对象
      paramsFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      isEditParamsDialogVisible: false,
      editParamsForm: {}
    }
  },
  mounted() {
    this.getCategoriesList()
  },
  methods: {
    // 获取商品分类数据
    async getCategoriesList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.categoriesList = res.data
    },
    // 获取分类id相对应的参数数据
    async getParamsList() {
      const { data: res } = await this.$http.get(`categories/${this.paramsInfo.id}/attributes`, {
        params: { sel: this.paramsInfo.sel }
      })
      if (res.meta.status !== 200) return this.$message.error('获取分类参数失败')

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.tagInputVisible = false
        item.tagInputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyParams = res.data
      } else {
        this.onlyParams = res.data
      }
    },
    handleChange(value) {
      // 如果长度不是3(不是3级分类)则不用
      if (value.length !== 3) {
        this.selectedCategory = []
        this.manyParams = []
        this.onlyParams = []
        return
      }
      this.paramsInfo.id = value[2]
      this.getParamsList()
    },
    handleClick() {
      this.paramsInfo.sel = this.activeName
      if (this.paramsInfo.id !== 0) this.getParamsList()
    },
    // 添加参数对话框关闭事件
    paramsDialogClosed() {
      this.$refs.addParamsFormRef.resetFields()
    },
    editParamsDialogClosed() {
      this.$refs.editParamsFormRef.resetFields()
    },
    async dialogSubmit() {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.paramsInfo.id}/attributes`, {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加' + this.dialogText + '失败')
        this.$message.success('添加' + this.dialogText + '成功')
        this.getParamsList()
        this.isParamsDialogVisible = false
      })
    },
    async showEditDialog(attrId) {
      const { data: res } = await this.$http.get(`categories/${this.paramsInfo.id}/attributes/` + attrId)
      if (res.meta.status !== 200) return this.$message.error('添加' + this.dialogText + '失败')
      this.editParamsForm = res.data

      this.isEditParamsDialogVisible = true
    },
    async dialogEditSubmit() {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.paramsInfo.id}/attributes/` + this.editParamsForm.attr_id,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.editParamsForm.attr_sel
          }
        )
        if (res.meta.status !== 200) return this.$message.error('更新' + this.dialogText + '失败')
        this.$message.success('更新' + this.dialogText + '成功')
        this.getParamsList()
        this.isEditParamsDialogVisible = false
      })
    },
    async deleteParams(attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete(`categories/${this.paramsInfo.id}/attributes/` + attrId)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getParamsList()
      } else if (confirmResult === 'cancel') {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
    },
    showInput(tag) {
      tag.tagInputVisible = true
      // $nextTick方法的作用，当页面上的元素被重新渲染之后，再执行回调函数
      this.$nextTick(_ => {
        this.$refs.tagInputRef.$refs.input.focus()
      })
    },
    async handleInputConfirm(tag) {
      if (tag.tagInputValue.trim().length !== 0) {
        tag.attr_vals.push(tag.tagInputValue.trim())
        this.updateTags(tag, '添加')
      }
      tag.tagInputValue = ''
      tag.tagInputVisible = false
    },
    // 删除对应的参数可选项
    async handleClose(tag, i) {
      tag.attr_vals.splice(i, 1)
      this.updateTags(tag, '删除')
    },
    async updateTags(tag, txt) {
      const { data: res } = await this.$http.put(`categories/${this.paramsInfo.id}/attributes/` + tag.attr_id, {
        attr_name: tag.attr_name,
        attr_sel: tag.attr_sel,
        attr_vals: tag.attr_vals.join(',')
      })
      if (res.meta.status !== 200) return this.$message.error(txt + '参数失败')
      this.$message.success(txt + '参数成功')
    }
  },
  computed: {
    // 商品分类是否被选用，选用则true
    isBtnDisabled() {
      if (this.selectedCategory.length === 3) {
        return false
      }
      return true
    },
    // 对话框文本
    dialogText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.select {
  margin: 15px 0;
}
.el-cascader {
  margin-left: 15px;
  width: 300px;
}
.el-menu {
  margin: 15px 0;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
