<template>
  <div v-loading="loading" class="app-container">
    <div class="header demo-input-suffix">
      <el-input
        v-model="param.keyword"
        placeholder="请输入用户昵称/用户账号"
        size="mini"
        style="width: 260px"/>
      <el-button size="mini" type="primary" @click="search">搜索</el-button>
      <span style="float:right;">
        <el-button-group>
          <el-button type="primary" icon="el-icon-refresh" size="mini" style="height:28px;" @click="get_data"/>
          <el-button type="primary" size="mini" @click="$refs['append'].init({title: '添加'})">添加</el-button>
        </el-button-group>
      </span>
    </div>
    <el-table :data="table_data.data" class="table" style="width: 100%">
      <el-table-column prop="uid" label="编号" />
      <el-table-column prop="username" label="姓名" />
      <el-table-column prop="college" label="学院" />
      <el-table-column prop="major" label="专业" />
      <el-table-column prop="class" label="班级" />
      <el-table-column prop="gender" label="性别">
        <template slot-scope="scope">
          <span v-if="scope.row.gender == 0">男</span>
          <span v-else-if="scope.row.gender == 1">女</span>
          <span v-else>未定义</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="操作" width="160" >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="$refs['userinfo'].init({title: '编辑', uid: scope.row.uid})">编辑</el-button>
          <el-popover v-model="scope.row.visible" placement="top" width="160">
            <p>确认删除</p>
            <div style="text-align: right; margin: 0">
              <el-button type="text" size="mini" @click="scope.row.visible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="del(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="text" size="mini" style="margin-left: 10px; color:red;">删除</el-button>
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
    <userinfo ref="userinfo" @reload="get_data"/>
    <append ref="append" @reload="get_data"/>

  </div>
</template>

<script>
import userinfo from './userinfo'
import append from './append'
export default {
  components: { userinfo, append },
  data() {
    return {
      table_data: [],
      param: {
        page: Number(this.$route.query.page ? this.$route.query.page : 1),
        page_size: this.$route.query.page_size ? this.$route.query.page_size : 20,
        keyword: this.$route.query.keyword ? this.$route.query.keyword : ''
      },
      picker_time: '',
      loading: false
    }
  },
  watch: {
    '$route'() {
      this.get_data()
    }
  },
  created() {
    this.picker_time = [this.$route.query.start_time * 1000, this.$route.query.end_time * 1000]
    this.init()
  },
  methods: {
    init() {
      this.get_data()
    },
    search() {
      this.param.page = 1

      if (this.picker_time) {
        this.param.start_time = this.picker_time[0] / 1000 // 开始时间 转化为10位时间戳
        this.param.end_time = this.picker_time[1] / 1000 // 结束时间
      } else {
        this.param.start_time = ''
        this.param.end_time = ''
      }

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
      this.$request.post('/admin/user/getListData', this.param).then((res) => {
        this.table_data = res.data.list
        this.param.page = res.data.list.current_page
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    del(item) {
      item.visible = false
      const data = { uid: item.uid }
      this.$request.post('/admin/user/delete', data).then((res) => {
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
    currentPage() {},
    show_image(img_url, title) {
      this.$alert('<img src="' + img_url + '" style="width:100%;">', title, {
        dangerouslyUseHTMLString: true
      })
    }
  }
}
</script>

<style lang="scss" scoped="">
.header{ margin-bottom: 15px; height: 28px;}
</style>
