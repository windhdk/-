<template>
  <div v-loading="loading" class="app-container">
    <div class="header demo-input-suffix">
      <span style="float:right;">
        <el-button-group>
          <el-button type="primary" icon="el-icon-refresh" size="mini" style="height:28px;" @click="get_data"/>
          <el-button type="primary" size="mini" @click="$refs['form'].init({title: '添加'})">添加管理员</el-button>
        </el-button-group>
      </span>
    </div>
    <!-- <div class="header">
      <el-button type="primary">添加分类</el-button>
    </div> -->
    <el-table :data="table_data.data" style="width: 100%">
      <el-table-column prop="id" label="id" width="100" align="center" />
      <el-table-column prop="username" label="名称" align="center" />
      <el-table-column prop="router_auth" label="角色" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.router_auth == 'admin'">超级管理员</span>
          <span v-if="scope.row.router_auth == 'editor'">普通管理员</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="电话" align="center" />
      <el-table-column prop="status" label="状态" align="center" >
        <template slot-scope="scope">
          <span v-if="scope.row.status == 1" style="color: rgb(14, 175, 0);">可用</span>
          <span v-if="scope.row.status == 0" style="color: red;">禁用</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="操作" width="80" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="$refs['formdata'].init({title: '编辑', id: scope.row.id})">编辑</el-button>
          <el-popover v-model="scope.row.visible" placement="top" width="160">
            <p>确认删除</p>
            <div style="text-align: right; margin: 0">
              <el-button type="text" size="mini" @click="scope.row.visible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="del(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="text" size="mini">删除</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <forms ref="form" @reload="get_data"/>
    <formdata ref="formdata" @reload="get_data"/>
    <el-pagination
      v-if="table_data.total"
      :current-page="param.page"
      :page-sizes="[20, 50, 100, 500]"
      :page-size="Number(param.page_size)"
      :total="table_data.total"
      style="padding:15px; text-align: right;"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import forms from './form'
import formdata from './formdata'
export default {
  components: { forms, formdata },
  data() {
    return {
      table_data: [],
      param: {
        page: Number(this.$route.query.page ? this.$route.query.page : 1),
        page_size: this.$route.query.page_size ? this.$route.query.page_size : 20,
        keyword: this.$route.query.keyword ? this.$route.query.keyword : ''
      },
      loading: false
    }
  },
  watch: {
    '$route'() {
      this.get_data()
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.get_data()
    },
    get_data() {
      this.loading = true
      this.$request.post('/admin/admin/getListData', this.param).then((res) => {
        this.table_data = res.data.list
        console(this.table_data)
        // this.param.page = res.data.list.current_page
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    del(item) {
      item.visible = false
      const data = { id: item.id }
      this.$request.post('/admin/admin/delete', data).then((res) => {
        this.$message({
          message: res.msg,
          type: 'success'
        })
        this.get_data()
      })
    },
    handleSizeChange(val) {
      this.param.page = 1
      this.param.page_size = val
      for (var i in this.param) {
        if (this.param[i] === '') {
          delete this.param[i]
        }
      }
      this.$router.push({ name: this.$route.name, query: this.param })
    },
    handleCurrentChange(val) {
      this.param.page = val
      for (var i in this.param) {
        if (this.param[i] === '') {
          delete this.param[i]
        }
      }
      this.$router.push({ name: this.$route.name, query: this.param })
    },
    currentPage() {}
  }
}
</script>

<style lang="scss" scoped="">
.header{ margin-bottom: 15px; height: 28px;}
</style>
