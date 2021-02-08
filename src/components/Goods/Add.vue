<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 标签页 -->
      <el-form :model="addGoodsForm" :rules="goodsFormRules" ref="addGoodsFormRef" label-position="top">
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器 -->
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="categoriesList"
                :props="cascaderProps"
                clearable
                ref="cascaderRef"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="(item, index) in manyParamsList" :key="index">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(params, index) in item.attr_vals"
                  :key="index"
                  :label="params"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item, index) in onlyParamsList" :key="index">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的api地址 -->
            <!-- upload控件不会调用axios所以要手动添加token请求头 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
              :headers="headerObj"
            >
              <el-button type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"> </quill-editor>
            <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <el-dialog title="图片预览" :visible.sync="dialogVisible" width="50%">
        <el-image :src="previewUrl"></el-image>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 默认激活的步骤条
      activeIndex: 0,
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
      addGoodsForm: {
        goods_name: '',
        goods_cat: [],
        goods_price: 1,
        goods_number: 1,
        goods_weight: 1,
        // 服务端临时保存的图片路径
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 商品分类的数据列表
      categoriesList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 商品参数列表
      manyParamsList: [],
      onlyParamsList: [],
      // 请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      dialogVisible: false,
      previewUrl: ''
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
    async getManyParams(id) {
      this.manyParamsList = await this.getParamsById(id, 'many')
    },
    async getOnlyParams(id) {
      this.onlyParamsList = await this.getParamsById(id, 'only')
      console.log(this.onlyParamsList)
    },
    // 获取商品参数通过id
    async getParamsById(id, sel) {
      const { data: res } = await this.$http.get(`categories/${id}/attributes`, { params: { sel: sel } })
      if (res.meta.status !== 200) return this.$message.error('获取商品参数失败')
      if (sel === 'many') {
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
      }
      return res.data
    },
    handleChange(value) {
      // 如果长度不是3(不是3级分类)则不用
      if (value.length !== 3) {
        this.addGoodsForm.goods_cat = []
        return
      }
      this.addGoodsForm.goods_cat = value
      // 选中商品后去除manu
      this.$refs.cascaderRef.dropDownVisible = false
    },
    beforeTabLeave(activeTab, oldActiveTab) {
      if (oldActiveTab === '0') {
        if (this.addGoodsForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品分类')
          return false
        } else {
          this.getManyParams(this.categoryId)
          this.getOnlyParams(this.categoryId)
        }
      }
    },
    tabClick() {
      if (this.activeIndex === '1') {
        this.getManyParams(this.categoryId)
      } else if (this.activeIndex === '2') {
        this.getOnlyParams(this.categoryId)
      }
    },
    // 处理图片的删除操作
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const findIndex = this.addGoodsForm.pics.findIndex(x => x === filePath)
      this.addGoodsForm.pics.splice(findIndex, 1)
    },
    // 处理图片的预览效果
    handlePreview(file) {
      this.previewUrl = file.response.data.url
      console.log(this.previewUrl)
      this.dialogVisible = true
    },
    // 上传图片成功
    handleSuccess(res) {
      this.addGoodsForm.pics.push(res.data.tmp_path)
    },
    async addGoods() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项')
        const form = _.cloneDeep(this.addGoodsForm)
        form.goods_cat = form.goods_cat.join(',')
        console.log()
        const paramsList = [...this.manyParamsList, ...this.onlyParamsList]
        paramsList.forEach(params => {
          form.attrs.push({
            attr_id: params.attr_id,
            attr_value: typeof params.attr_vals === 'object' ? params.attr_vals.join(' ') : params.attr_vals
          })
        })
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取商品分类Id
    categoryId() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2]
      }
      return 0
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 15px 0 0 !important;
}
.btnAdd {
  margin-top: 15px;
}
</style>
