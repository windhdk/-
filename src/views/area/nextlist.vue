<template>
  <div v-loading="loading" class="app-container">
    <div class="header demo-input-suffix">
      <el-input
        v-model="param.keyword"
        placeholder="请输入关键字"
        size="mini"
        style="width: 110px"/>
      <el-button size="mini" type="primary" @click="search">搜索</el-button>
      <span style="float:right;">
        <el-button-group>
          <el-button type="primary" icon="el-icon-refresh" size="mini" style="height:28px;" @click="get_data"/>
        </el-button-group>
      </span>
    </div>
    <el-table :data="table_data.data" style="width: 100%">
      <el-table-column prop="id" label="编号" align="center"/>
      <el-table-column prop="area_name" label="名称" align="center" />
      <el-table-column prop="parent_id" label="父栏目" align="center" />
      <el-table-column prop="show" label="是否显示" align="center" />
      <el-table-column prop="sort" label="操作" width="250px" align="center">
        <template slot-scope="scope">
          <el-button v-if="previous" type="text" size="small" @click="$router.push({name: 'pre_area_list', params: {id: scope.row.id}})">上一级</el-button>
          <el-button v-if="next" type="text" size="small" @click="$router.push({name: 'next_area_list', params: {id: scope.row.id}})">下一级</el-button>
          <el-button v-if="append" type="text" size="small" @click="$refs['append'].init({title: '添加', id: scope.row.id})">添加</el-button>
          <el-button v-if="edit" type="text" size="small" @click="$refs['form'].init({title: '编辑', id: scope.row.id})">编辑</el-button>
          <el-popover v-if="delete_list" v-model="scope.row.visible" placement="top" width="160">
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
    <forms ref="form" @reload="get_data"/>
    <append ref="append" @reload="get_data"/>
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
import forms from './components/form'
import append from './components/append'
export default {
  components: { forms, append },
  data() {
    return {
      table_data: [],
      next: true,
      previous: false,
      append: false,
      edit: false,
      delete_list: false,
      pre_judge: 0,
      next_judge: 1,
      operate_judge: 0,
      param: {
        page: Number(this.$route.query.page ? this.$route.query.page : 1),
        page_size: this.$route.query.page_size ? this.$route.query.page_size : 20,
        keyword: this.$route.query.keyword ? this.$route.query.keyword : '',
        id: this.$route.params.id ? this.$route.params.id : 0
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
    get_data() {
      this.loading = true
      delete this.param.t
      this.param.id = this.$route.params.id ? this.$route.params.id : 0
      this.param.page = Number(this.$route.query.page ? this.$route.query.page : 1)
      this.$request.post('/admin/Area/getNextList', this.param).then((res) => {
        this.table_data = res.data.area_list
        this.param.page = res.data.area_list.current_page
        this.pre_judge = this.table_data.data[0].level
        this.next_judge = this.table_data.data[0].level
        this.operate_judge = this.table_data.data[0].level
        if (this.pre_judge !== 1) {
          this.previous = true
        } else {
          this.previous = false
        }
        if (this.next_judge !== 5) {
          this.next = true
        } else {
          this.next = false
        }
        if (this.operate_judge > 3) {
          this.append = true
          this.edit = true
          this.delete_list = true
        } else {
          this.append = false
          this.edit = false
          this.delete_list = false
        }
        if (this.operate_judge === 5) {
          this.append = false
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    del(item) {
      item.visible = false
      const data = { id: item.id }
      console.log(data)
      this.$request.post('/admin/Area/delete', data).then((res) => {
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
    // 批量删除
    batchDelete(rows) {
      this.$confirm('是否确认此操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        rows.forEach(element => {
          this.ids.push(element.id)
        })
        const data = { ids: this.ids }
        this.loading = true
        this.$request.post('/admin/Area/batchDelete', data).then((res) => {
          console.log('test1')
          if (res.data.result === 'success') {
            console.log('test2')
            this.$message({
              message: res.msg,
              type: 'success'
            })
            // 将之前压进栈里面的数据弄出来，保持每次压进的数据都是最新的
            rows.forEach(element => {
              this.ids.pop(element.id)
            })
            this.get_data()
          } else {
            console.log('test3')
            this.$message({
              message: res.msg,
              type: 'warning'
            })
            // 将之前压进栈里面的数据弄出来，保持每次压进的数据都是最新的
            rows.forEach(element => {
              this.ids.pop(element.id)
            })
            this.get_data()
          }
          this.loading = false
        }).catch(() => {
          // 将之前压进栈里面的数据弄出来，保持每次压进的数据都是最新的
          rows.forEach(element => {
            this.ids.pop(element.id)
          })
          this.loading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
        // this.get_data()
      })
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
