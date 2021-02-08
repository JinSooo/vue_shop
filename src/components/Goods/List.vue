<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <div class="top">
        <!-- 搜索输入框 -->
        <el-input placeholder="请输入内容" v-model="goodsInfo.query" clearable @clear="getGoodsList">
          <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
        </el-input>
        <!-- 添加商品按钮 -->
        <el-button type="primary" @click="goAddPage">添加商品</el-button>
      </div>
      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"> </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"> </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="160px">
          <template slot-scope="scope">
            <!-- 使用全局定义的过滤器 -->
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="goodsInfo.pagenum"
        :page-size="goodsInfo.pagesize"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加参数对话框 -->
      <el-dialog title="添加商品" :visible.sync="isAddGoodsDialogVisible" width="30%" @close="addGoodsDialogClosed">
        <!-- 内容主题区域 -->
        <el-form :model="addGoodsForm" :rules="goodsFormRules" ref="addGoodsFormRef" label-width="80px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addGoodsForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="分类列表" prop="goods_cat">
            <el-input v-model="addGoodsForm.goods_cat"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addGoodsForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addGoodsForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addGoodsForm.goods_weight"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isAddGoodsDialogVisible = false">取 消</el-button>
          <el-button type="primary">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改参数对话框 -->
      <el-dialog title="修改商品" :visible.sync="isEditGoodsDialogVisible" width="30%" @close="editGoodsDialogClosed">
        <!-- 内容主题区域 -->
        <el-form :model="editGoodsForm" :rules="goodsFormRules" ref="editGoodsFormRef" label-width="80px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editGoodsForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="editGoodsForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="editGoodsForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editGoodsForm.goods_weight"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isEditGoodsDialogVisible = false">取 消</el-button>
          <el-button type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品请求参数信息
      goodsInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表数据
      goodsList: [],
      // 总数量
      total: 0,
      // 表单的验证规则对象
      goodsFormRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: '请输入商品分类列表',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }
        ]
      },
      isAddGoodsDialogVisible: false,
      addGoodsForm: {
        goods_name: '',
        goods_cat: '',
        goods_price: '',
        goods_number: '',
        goods_weight: ''
      },
      isEditGoodsDialogVisible: false,
      editGoodsForm: {}
    }
  },
  mounted() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.goodsInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.goodsInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.goodsInfo.pagenum = newPage
      this.getGoodsList()
    },
    addGoodsDialogClosed() {
      this.$refs.addGoodsFormRef.resetFields()
    },
    editGoodsDialogClosed() {
      this.$refs.editGoodsFormRef.resetFields()
    },
    async showEditDialog(goodsId) {
      const { data: res } = await this.$http.get('goods/' + goodsId)
      if (res.meta.status !== 200) return this.$message.error('获取商品失败')
      console.log(res)
      this.editGoodsForm = res.data

      this.isEditGoodsDialogVisible = true
    },
    async addGoods() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('goods/', this.addGoodsForm)
        if (res.meta.status !== 200) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
      })
    },
    async editGoods() {
      this.$refs.editGoodsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('goods/' + this.editGoodsForm.goods_id, {
          goods_name: this.editGoodsForm.goods_name,
          goods_price: this.editGoodsForm.goods_price,
          goods_number: this.editGoodsForm.goods_number,
          goods_weight: this.editGoodsForm.goods_weight
        })
        if (res.meta.status !== 200) return this.$message.error('修改商品失败')
        this.$message.success('修改商品成功')
      })
    },
    async deleteGoods(goodsId) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('goods/' + goodsId)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getGoodsList()
      } else if (confirmResult === 'cancel') {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
    },
    goAddPage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
.top > .el-input {
  width: 400px;
  margin-right: 15px;
}
</style>
