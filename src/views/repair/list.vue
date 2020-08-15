<template>
  <div v-loading="loading" class="app-container">
    <div class="header demo-input-suffix">
      <span style="float:right;">
        <el-button-group>
          <el-button type="primary" icon="el-icon-refresh" size="mini" style="height:28px;" @click="get_data"/>
          <el-dropdown @command="handleCommand">
            <el-button type="primary" size="small" style="height:28px;">
              更多菜单
              <i class="el-icon-arrow-down el-icon--right"/>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="pass">批量已处理</el-dropdown-item>
              <el-dropdown-item command="refuse">批量未处理</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-button-group>
      </span>
    </div>
    <el-tabs v-if="param.category_value" v-model="param.category_value" @tab-click="handle_click_tabs">
      <el-tab-pane v-for="(item, index) in category_option" :key="index" :label="item.label" :name="item.value" />
    </el-tabs>
    <el-table :data="table_data.data" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" label="选中"/>
      <el-table-column prop="id" label="编号" align="center"/>
      <el-table-column prop="type" label="类型" align="center"/>
      <el-table-column prop="username" label="提交人" align="center"/>
      <el-table-column prop="uid" label="用户账号" align="center"/>
      <el-table-column prop="status" label="状态" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.status == 0" style="color: rgb(14, 175, 0);">未处理</span>
          <span v-if="scope.row.status == 1" style="color: red;">已处理</span>
        </template>
      </el-table-column>
      <el-table-column prop="create_time_label" label="报修时间" align="center"/>
      <el-table-column prop="sort" label="操作" width="240" align="center" >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="pass(scope.row)">已处理</el-button>
          <el-button type="text" size="small" @click="refuse(scope.row)">未处理</el-button>
          <el-button type="text" size="small" @click="$refs['formdata'].init({title: '详情', id: scope.row.id})">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
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
import { mapGetters } from 'vuex'
import formdata from './components/formdata'

export default {
  name: 'Dashboard',
  components: { formdata },
  data() {
    return {
      table_data: [],
      category_option: [],
      multipleSelection: [],
      param: {
        page: Number(this.$route.query.page ? this.$route.query.page : 1),
        page_size: this.$route.query.page_size ? this.$route.query.page_size : 20,
        category_value: ''
      },
      loading: false
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
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
    search() {
      this.param.page = 1
      for (var i in this.param) {
        if (this.param[i] === '') {
          delete this.param[i]
        }
      }
      this.param.t = (new Date()).valueOf()
      this.$router.push({ name: this.$route.name, query: this.param })
    },
    get_data() {
      this.loading = true
      delete this.param.t
      this.$request.post('/admin/Info_Repair/getListData', this.param).then((res) => {
        console.log(res.data.list)
        this.category_option = res.data.category_option
        this.table_data = res.data.list
        this.param.page = res.data.list.current_page
        this.loading = false

        if (this.param.category_value === '') {
          this.param.category_value = this.category_option[0].value
        }
      }).catch(() => {
        this.loading = false
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
    currentPage() {},
    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log(this.multipleSelection)
    },
    handleCommand(command) {
      const length = this.multipleSelection.length
      this.idSelection = []
      if (length > 0) {
        for (var i = 0; i < length; i++) {
          this.idSelection.push(this.multipleSelection[i].id)
        }
        console.log(this.idSelection)
        switch (command) {
          case 'pass':
            this.listpass()
            break
          case 'refuse':
            this.listrefuse()
            break
        }
      } else {
        this.$message({
          message: '请选择栏目',
          type: 'warning'
        })
      }
    },
    // 通过
    pass(item) {
      const param = {
        id: item.id
      }
      item.pass_loading = true
      this.$request.post('/admin/Info_Repair/pass', param).then(res => {
        item.pass_loading = false
        this.get_data()
      }).catch(() => {
        item.pass_loading = false
      })
    },
    // 批量通过
    listpass() {
      const data = { idList: this.idSelection }
      console.log(data)
      this.$request.post('/admin/Info_Repair/listpass', data).then(res => {
        this.get_data()
      }).catch(() => {
      })
    },
    refuse(item) {
      const param = {
        id: item.id
      }
      item.pass_loading = true
      this.$request.post('/admin/Info_Repair/refuse', param).then(res => {
        item.refuse_loading = false
        this.get_data()
      }).catch(() => {
        item.refuse_loading = false
      })
    },
    listrefuse() {
      const data = { idList: this.idSelection }
      this.$request.post('/admin/Info_Repair/listrefuse', data).then(res => {
        this.get_data()
      }).catch(() => {
        this.loading = false
      })
    },
    handle_click_tabs(tab, event) {
      console.log(tab)
      console.log(event)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.header{ margin-bottom: 15px; height: 28px;}
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
