<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索输入框 -->
      <el-input placeholder="请输入内容" v-model="ordersInfo.query" clearable @clear="getOrdersList">
        <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
      </el-input>
      <!-- 表格区域 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号"> </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="95px"> </el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="100px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="70px"> </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200px">
          <template slot-scope="scope">
            <!-- 使用全局定义的过滤器 -->
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template>
            <el-button type="primary" icon="el-icon-edit" @click="isEditOrdersDialogVisible = true"></el-button>
            <el-button type="success" icon="el-icon-location" @click="showKuaidiDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="ordersInfo.pagenum"
        :page-size="ordersInfo.pagesize"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 修改信息对话框 -->
      <el-dialog title="添加商品" :visible.sync="isEditOrdersDialogVisible" width="30%" @close="editOrdersDialogClosed">
        <!-- 内容主题区域 -->
        <el-form :model="editOrdersForm" :rules="ordersFormRules" ref="editOrdersFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader
              v-model="editOrdersForm.address1"
              :options="cityData"
              :props="cascaderProps"
              clearable
              ref="cascaderRef"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="editOrdersForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isEditOrdersDialogVisible = false">取 消</el-button>
          <el-button type="primary">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 快递信息对话框 -->
      <el-dialog title="快递信息" :visible.sync="isKuaidiDialogVisible" width="30%">
        <el-timeline :reverse="true">
          <el-timeline-item v-for="(kuaidi, index) in kuaidiList" :key="index" :timestamp="kuaidi.time">
            {{ kuaidi.context }}
          </el-timeline-item>
        </el-timeline>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="isKuaidiDialogVisible = false">取 消</el-button>
          <el-button type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  data() {
    return {
      // 订单请求参数信息
      ordersInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 订单列表数据
      ordersList: [],
      // 总数量
      total: 0,
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'value',
        label: 'label',
        children: 'children',
        expandTrigger: 'hover'
      },
      isEditOrdersDialogVisible: false,
      editOrdersForm: {
        address1: [],
        address2: ''
      },
      // 表单的验证规则对象
      ordersFormRules: {
        address1: [
          {
            required: true,
            message: '请选择省市区县',
            trigger: 'blur'
          }
        ],
        address2: [
          {
            required: true,
            message: '请输入详细地址',
            trigger: 'blur'
          }
        ]
      },
      cityData,
      isKuaidiDialogVisible: false,
      kuaidiList: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
    }
  },
  mounted() {
    this.getOrdersList()
  },
  methods: {
    // 获取订单数据
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', { params: this.ordersInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    // 获取快递信息列表
    // async getKuaidiList() {
    //   const { data: res } = await this.$http.get('kuaidi/804909574412544580')
    //   if (res.meta.status !== 200) return this.$message.error('获取快递信息失败')
    //   console.log(res)
    //   this.kuaidiList = res.data
    // },
    handleSizeChange(newSize) {
      this.ordersInfo.pagesize = newSize
      this.getOrdersList()
    },
    handleCurrentChange(newPage) {
      this.ordersInfo.pagenum = newPage
      this.getOrdersList()
    },
    editOrdersDialogClosed() {
      this.$refs.editOrdersFormRef.resetFields()
    },
    showKuaidiDialog() {
      // this.getKuaidiList()
      this.isKuaidiDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-card > .el-input {
  width: 400px;
  margin-right: 15px;
}
</style>
