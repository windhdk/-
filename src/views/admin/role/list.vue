<template>
  <div v-loading="loading" class="app-container">
    <div class="header demo-input-suffix">
      <span style="float:right;">
        <el-button-group>
          <el-button type="primary" icon="el-icon-refresh" size="mini" style="height:28px;" @click="get_data"/>
          <el-button type="primary" size="mini" @click="$router.push( { name: 'append_role' } )">添加角色</el-button>
        </el-button-group>
      </span>
    </div>
    <!-- <div class="header">
      <el-button type="primary">添加分类</el-button>
    </div> -->
    <el-table :data="table_data.data" style="width: 100%">
      <el-table-column prop="role_name" label="角色" />
      <el-table-column label="操作" width="80" >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="$router.push({name: 'update_role', params: {id: scope.row.id}})">编辑</el-button>
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
export default {
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
      delete this.param.t
      this.$request.post('/admin/admin_role/getListData', this.param).then((res) => {
        this.table_data = res.data.list
        this.param.page = res.data.list.current_page
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    del(item) {
      item.visible = false
      const data = { id: item.id }
      this.$request.post('/admin/admin_role/delete', data).then((res) => {
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
          this.param.splice(i, 1)
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
