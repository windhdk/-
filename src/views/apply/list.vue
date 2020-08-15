<template>
  <div v-loading="loading" class="app-container">
    <div class="header apply-input-suffix">
      <div class="header-input-item">
        手机号码：<el-input
          v-model="searchparam.phone"
          placeholder="请输入手机号码"
          size="small"
          style="width: 100px"/>
      </div>
      <div class="header-input-item">
        名称：<el-input
          v-model="searchparam.name"
          placeholder="请输入名称"
          size="small"
          style="width: 100px"/>
      </div>
      <div class="header-input-item">
        产品类型： <el-select v-model="searchparam.product_id" size="small" placeholder="请选择产品类型">
          <el-option
            v-for="item in product_options"
            :key="item.id"
            :label="item.name"
            :value="item.id"/>
        </el-select>
      </div>
      <div class="header-input-item">
        状态：<el-select v-model="values" size="small" placeholder="状态" @change="setStatus()">
          <el-option
            v-for="item in options"
            :key="item.values"
            :label="item.label"
            :value="item.values"/>
        </el-select>
      </div>
      <el-button size="small" type="primary" icon="el-icon-search" @click="searchapply">查询</el-button>
      <span style="float:right;">
        <el-button-group>
          <el-button type="primary" icon="el-icon-refresh" size="mini" style="height:28px;" @click="get_data"/>
          <el-dropdown @command="handleCommand">
            <el-button type="primary" size="small" style="height:28px;">
              更多菜单
              <i class="el-icon-arrow-down el-icon--right"/>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="delete">批量删除</el-dropdown-item>
              <el-dropdown-item command="pass">批量通过</el-dropdown-item>
              <el-dropdown-item command="refuse">批量拒绝</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-button-group>
      </span>
    </div>
    <el-tabs v-if="param.category_value" v-model="param.category_value" @tab-click="handle_click_tabs">
      <el-tab-pane v-for="(item, index) in category_option" :key="index" :label="item.label" :name="item.value" />
    </el-tabs>
    <el-table :data="table_data.data" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" label="选中" width="55" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column prop="product_name" label="产品" />
      <el-table-column label="性别">
        <template slot-scope="scope">
          {{ scope.row.sex == 1 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column label="地址">
        <template slot-scope="scope">
          {{ scope.row.province + scope.row.city + scope.row.district + scope.row.town + scope.row.village + scope.row.address }}
        </template>
      </el-table-column>
      <el-table-column label="供货时间">
        <template slot-scope="scope">
          <span v-if="scope.row.supply_time_type == 1">长期</span>
          <span v-else>{{ scope.row.start_time_label }} 至 {{ scope.row.end_time_label }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核状态">
        <template slot-scope="scope">
          <span v-if="scope.row.status == 1">未通过</span>
          <span v-if="scope.row.status == 2" style="color: rgb(14, 175, 0);">已通过</span>
          <span v-if="scope.row.status == 3" style="color: red;">已拒绝</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="操作" width="140" >
        <template slot-scope="scope">
          <el-button :loading="scope.row.pass_loading" type="text" size="small" @click="pass(scope.row)">通过</el-button>
          <el-button :loading="scope.row.refuse_loading" type="text" size="small" @click="refuse(scope.row)">拒绝</el-button>
          <!-- <el-button type="text" size="small" @click="$refs['form'].init({title: '编辑', id: scope.row.id})">编辑</el-button> -->
          <el-popover v-model="scope.row.visible" placement="top" width="160">
            <p>确认删除</p>
            <div style="text-align: right; margin: 0">
              <el-button type="text" size="mini" @click="scope.row.visible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="del(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="text" size="mini" style="margin-left: 10px;">删除</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :visible.sync="delVisible"
      title="提示"
      width="300px"
      center>
      <div class="del-dialog-cnt">
        删除不可恢复，是否确定删除？
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="deleteList" >
          确 定
        </el-button>
        <el-button @click="delVisible = false">
          取 消
        </el-button>
      </span>
    </el-dialog>
    <!-- <forms ref="form" @reload="get_data"/> -->
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
// import forms from './components/form'
export default {
  // components: { forms },
  data() {
    return {
      table_data: [],
      options: [{ values: 1, label: '未通过' }, { values: 2, label: '已通过' }, { values: 3, label: '拒绝' },
        { values: '', label: '所有状态' }],
      values: '',
      product_options: [],
      delVisible: false,
      category_option: [],
      multipleSelection: [],
      idSelection: [],
      param: {
        page: Number(this.$route.query.page ? this.$route.query.page : 1),
        page_size: this.$route.query.page_size ? this.$route.query.page_size : 20,
        category_value: '',
        phone: '',
        name: '',
        status: '',
        product_id: ''
      },
      searchparam: {
        page: Number(this.$route.query.page ? this.$route.query.page : 1),
        page_size: this.$route.query.page_size ? this.$route.query.page_size : 20,
        phone: '',
        name: '',
        status: '',
        product_id: ''
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
    searchapply() {
      console.log(this.searchparam.product_id)
      this.loading = true
      this.$request.post('/admin/apply/getListDataIndata', this.searchparam).then((res) => {
        this.category_option = res.data.category_option
        this.table_data = res.data.list
        this.param.page = res.data.list.current_page
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    get_data() {
      this.loading = true
      delete this.param.t
      this.$request.post('/admin/apply/getListData', this.param).then((res) => {
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
      this.loading = true
      this.$request.post('/admin/product/getListData', this.param).then((res) => {
        console.log(res.data.list.data)
        res.data.list.data.push({ id: '', name: '所有类型' })
        this.product_options = res.data.list.data
      }).catch(() => {
        this.loading = false
      })
    },
    del(item) {
      item.visible = false
      const data = { id: item.id }
      this.$request.post('/admin/apply/delete', data).then((res) => {
        this.$message({
          message: res.msg,
          type: 'success'
        })
        this.get_data()
      })
    },
    deleteList() {
      this.delVisible = false
      const data = { idList: this.idSelection }
      console.log(data)
      this.$request.post('/admin/apply/listdelete', data).then((res) => {
        this.$message({
          message: res.msg,
          type: 'success'
        })
        this.searchapply()
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
    setStatus() {
      console.log(this.values)
      if (this.values === '') {
        this.searchparam.status = ''
      } else {
        this.searchparam.status = this.values
      }
    },
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
          case 'delete':
            this.delVisible = true
            break
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
    handle_click_tabs(tab, event) {
      console.log(tab)
      console.log(event)
    },
    // 通过
    pass(item) {
      const param = {
        id: item.id
      }
      item.pass_loading = true
      this.$request.post('/admin/apply/pass', param).then(res => {
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
      this.$request.post('/admin/apply/listpass', data).then(res => {
        this.searchapply()
      }).catch(() => {
      })
    },
    refuse(item) {
      this.$prompt('请输入拒绝原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const param = {
          id: item.id,
          info: value
        }
        item.refuse_loading = true
        this.$request.post('/admin/apply/refuse', param).then(res => {
          item.refuse_loading = false
          this.get_data()
        }).catch(() => {
          item.refuse_loading = false
        })
      }).catch(() => {
      })
    },
    listrefuse() {
      this.$prompt('请输入拒绝原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const param = {
          idList: this.idSelection,
          info: value
        }
        this.loading = true
        this.$request.post('/admin/apply/listrefuse', param).then(res => {
          this.searchapply()
        }).catch(() => {
          this.loading = false
        })
      }).catch(() => {
      })
    }
  }
}
</script>

<style lang="scss" scoped="">
.header{ margin-bottom: 15px; height: 28px;}
</style>
