<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 添加商品分类按钮 -->
      <el-button type="primary" @click="showAddCategory">添加分类</el-button>
      <!-- 商品分类区域 -->
      <tree-table
        class="tree-table"
        :data="categoriesList"
        :columns="columns"
        show-index
        index-text="#"
        :selection-type="false"
        :expand-type="false"
        border
        :show-row-hover="false"
      >
        <template slot="isDeleted" slot-scope="scope">
          <span class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: green"></span>
          <span class="el-icon-error" v-else style="color: red"></span>
        </template>
        <template slot="isLevel" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template slot="isAction" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="showEditCategory(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="categoriesInfo.pagenum"
        :page-size="categoriesInfo.pagesize"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加商品分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="isAddCategoriesDialogVisible"
        width="30%"
        @close="addCategoriesDialogClosed"
      >
        <!-- 内容主题区域 -->
        <el-form :model="addCategoriesForm" :rules="categoriesFormRules" ref="addCategoriesFormRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCategoriesForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              v-model="selectedCategory"
              :options="categoriesOptions"
              @change="handleChange"
              :props="cascaderProps"
              clearable
              ref="cascaderRef"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isAddCategoriesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCategory">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改商品分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="isEditCategoriesDialogVisible"
        width="30%"
        @close="editCategoriesDialogClosed"
      >
        <!-- 内容主题区域 -->
        <el-form
          :model="editCategoriesForm"
          :rules="categoriesFormRules"
          ref="editCategoriesFormRef"
          label-width="80px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCategoriesForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isEditCategoriesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCategory">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取商品分类数据的参数对象
      categoriesInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据对象
      categoriesList: [],
      // 总商品分类数量
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'isDeleted'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'isLevel'
        },
        {
          label: '操作',
          type: 'template',
          template: 'isAction'
        }
      ],
      isAddCategoriesDialogVisible: false,
      // 选中的父级分类
      selectedCategory: [],
      isEditCategoriesDialogVisible: false,
      addCategoriesForm: {
        cat_name: '',
        // 几级分类
        cat_level: 0,
        // 是否有父元素(父元素ID)
        cat_pid: 0
      },
      editCategoriesForm: {},
      // 商品分类的1，2级列表
      categoriesOptions: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 角色表单的验证规则对象
      categoriesFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  mounted() {
    this.getCategoriesList()
  },
  methods: {
    // 获取商品分类数据
    async getCategoriesList() {
      const { data: res } = await this.$http.get('categories', { params: this.categoriesInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.categoriesList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.categoriesInfo.pagesize = newSize
      this.getCategoriesList()
    },
    handleCurrentChange(newPage) {
      this.categoriesInfo.pagenum = newPage
      this.getCategoriesList()
    },
    handleChange(value) {
      if (value.length > 0) {
        this.addCategoriesForm.cat_pid = value[value.length - 1]
      } else {
        this.addCategoriesForm.cat_pid = 0
      }
      this.addCategoriesForm.cat_level = value.length || 0
      // 选中商品后去除manu
      this.$refs.cascaderRef.dropDownVisible = false
    },
    // 关闭添加商品分类对话框的事件
    addCategoriesDialogClosed() {
      this.$refs.addCategoriesFormRef.resetFields()
      this.selectedCategory = ''
      this.addCategoriesForm.cat_pid = 0
      this.addCategoriesForm.cat_level = 0
      this.addCategoriesForm.cat_name = ''
    },
    editCategoriesDialogClosed() {
      this.$refs.editCategoriesFormRef.resetFields()
      this.editCategoriesForm = {}
    },
    async showAddCategory() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.categoriesOptions = res.data
      this.isAddCategoriesDialogVisible = true
    },
    async showEditCategory(categoryId) {
      const { data: res } = await this.$http.get('categories/' + categoryId)
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.editCategoriesForm = res.data
      this.isEditCategoriesDialogVisible = true
    },
    async addCategory() {
      this.$refs.addCategoriesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCategoriesForm)
        if (res.meta.status !== 201) return this.$message.error('添加商品分类失败')
        this.$message.success('添加商品分类成功')
        this.isAddCategoriesDialogVisible = false
        this.getCategoriesList()
      })
    },
    async editCategory() {
      console.log(this.editCategoriesForm)
      this.$refs.editCategoriesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCategoriesForm.cat_id, {
          cat_name: this.editCategoriesForm.cat_name
        })
        if (res.meta.status !== 200) return this.$message.error('修改商品名称失败')
        this.$message.success('修改商品名称成功')
        this.isEditCategoriesDialogVisible = false
        this.getCategoriesList()
      })
    },
    // 删除用户功能
    async deleteRole(categoryId) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('categories/' + categoryId)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getCategoriesList()
      } else if (confirmResult === 'cancel') {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.tree-table {
  font-size: 14px;
  margin-top: 30px;
}
.el-cascader {
  width: 100%;
}
</style>
