<template>
  <div class="app-container">
    <div class="area">
      <div class="block">
        <p>地区选择</p>
        <el-tree :data="area_options" :props="props" :load="load_node_area" :accordion="true" lazy node-key="value" @node-click="handleNodeClick" @node-expand="node_expand">
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
    </div>
    <div v-loading="loading" class="stage">
      <div class="header stage-input-suffix">
        <div class="header-input-item">
          驿站名：<el-input
            v-model="searchparam.yizhan"
            placeholder=""
            size="mini"
            style="width: 175px"/>
        </div>
        <el-button size="mini" type="primary" icon="el-icon-search" @click="searchstage">查询</el-button>
        <span style="float:right;">
          <el-upload
            :on-preview="handlePreview"
            :on-exceed="handleExceed"
            :limit="1"
            :show-file-list="false"
            :http-request="uploadFile"
            class="upload-demo"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            list-type="text"
            action=""
            style="display: inline-block;">
            <el-button size="mini" type="primary">数据导入</el-button>
          </el-upload>
          <el-dropdown>
            <el-button type="primary" size="mini">
              批量操作<i class="el-icon-arrow-down el-icon--right"/>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <span style="display:block;" @click="batchDelete(tableChecked)">批量删除</span>
              </el-dropdown-item>
              <el-dropdown-item divided>
                <span style="display:block;" @click="exportQR(tableChecked)">导出二维码</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button-group>
            <el-button v-if="show_add" type="primary" size="mini" @click="$refs['form'].init({title: '添加', area_data})">添加</el-button>
            <el-button type="primary" icon="el-icon-refresh" size="mini" style="height:28px;" @click="get_data()"/>
          </el-button-group>
        </span>
      </div>
      <el-table :data="table_data.data" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="35" />
        <el-table-column prop="id" label="二维码">
          <template slot-scope="scope">
            <div @click="$refs['qr'].init({title: '二维码', id: scope.row.id})">
              <qrcode :value="scope.row.qr" :options="{ size: 70 }"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="address" label="地址" width="140"/>
        <el-table-column prop="phone" label="电话" width="140"/>
        <el-table-column prop="sort" label="排序" width="140"/>
        <el-table-column prop="sort" label="操作" width="140" >
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="$refs['form'].init({title: '编辑', id: scope.row.id})">编辑</el-button>
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
      <forms ref="form" @reload="get_data(area_map)"/>
      <qr ref="qr" align="center" @reload="get_data(area_map)"/>
      <el-pagination
        v-if="table_data.total"
        :current-page="param.page"
        :page-sizes="[3,4,5,6]"
        :page-size="Number(param.page_size)"
        :total="table_data.total"
        style="padding:15px; text-align: right;"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import forms from './components/form'
import qr from './components/vue_qrcode'
import qrcode from '@xkeshi/vue-qrcode'
export default {
  components: { forms, qrcode, qr },
  data() {
    return {
      tableChecked: [], // 被选中的记录数据-----对应“批量删除”传的参数值
      ids: [], // 批量删除id
      level: 0,
      area_name: '',
      stage_exit: [],
      table_data: [],
      area_options: [],
      param: {
        page: Number(this.$route.query.page ? this.$route.query.page : 1),
        page_size: this.$route.query.page_size ? this.$route.query.page_size : 20,
        id: 0
      },
      searchparam: {
        page: Number(this.$route.query.page ? this.$route.query.page : 1),
        page_size: this.$route.query.page_size ? this.$route.query.page_size : 20,
        yizhan: ''
      },
      props: {
        label: 'area_name',
        value: 'id'
      },
      show_add: false,
      area_data: {},
      loading: false
    }
  },
  // 计算属性
  computed: {
    area_map() {
      return {
        area_name: this.area_name,
        level: this.level
      }
    }
  },
  // 监听器
  watch: {
    '$route'() {
      this.get_data()
    },
    area_map() {
      console.log(this.area_map)
      this.show_add = this.area_map.level === 5
      var area_name = this.area_map.area_name
      this.area_data.yizhan = area_name
      this.get_data(this.area_map)
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.get_data()
    },
    searchstage() {
      console.log(this.searchparam)
      this.loading = true
      this.$request.post('/admin/stage/getListDataInareaname', this.searchparam).then((res) => {
        this.table_data = res.data.list
        console.log(res.data.list)
        this.param.page = res.data.list.current_page
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
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
    get_area_data() {
      this.$request.post('/admin/area/getAreaData').then((res) => {
        this.area_options = res.data.area_list
      }).catch(() => {
        this.loading = false
      })
    },
    // 懒加载
    load_node_area(node, resolve) {
      const param = {
        parent_id: node.data.id
      }
      this.$request.post('/admin/area/getAreaData', param).then((res) => {
        const area_options = res.data.area_list
        resolve(area_options)
      }).catch(() => {
        this.loading = false
      })
    },
    get_data() {
      var area_map = this.area_map
      this.loading = true
      delete this.param.t
      const data = {
        area_map,
        page: this.param.page,
        page_size: this.param.page_size
      }
      this.$request.post('/admin/stage/getListData', data).then((res) => {
        this.table_data = res.data.list
        this.param.page = res.data.list.current_page
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleNodeClick(node, data) {
      this.area_name = node.area_name
      this.level = node.level
    },
    node_expand(node, data) {
      this.area_name = node.area_name
      this.level = node.level
    },
    exportQR(rows) {
      this.loading = true
      var area_map = this.area_map
      rows.forEach(element => {
        this.ids.push(element.id)
      })
      const data = {
        area_map,
        ids: this.ids
      }
      console.log(data)
      this.$request.post('/admin/stage/exportQR', data).then((res) => {
        var link = document.createElement('a') // 创建一个a标签
        link.href = res.data.url
        link.download = res.data.url
        link.click()
        rows.forEach(element => {
          this.ids.pop(element.id)
        })
        this.get_data()
      }).catch(() => {
        rows.forEach(element => {
          this.ids.pop(element.id)
        })
        console.log('error')
        this.get_data()
      })
    },
    // 批量删除
    batchDelete(rows) {
      this.loading = true
      this.$confirm('是否确认此操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        rows.forEach(element => {
          this.ids.push(element.id)
        })
        const data = { ids: this.ids }
        console.log(data)
        this.$request.post('/admin/stage/batchDelete', data).then((res) => {
          console.log(res.data.result)
          if (res.data.result === 'success') {
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
            this.$message({
              message: res.msg,
              type: 'warning'
            })
            // 将之前压进栈里面的数据弄出来，保持每次压进的数据都是最新的
            rows.forEach(element => {
              this.ids.pop(element.id)
            })
            console.log(this.ids)
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
        this.get_data()
        this.loading = false
      })
    },
    del(item) {
      item.visible = false
      const data = { id: item.id }
      this.$request.post('/admin/stage/delete', data).then((res) => {
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
      console.log(this.param)
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
    handleSelectionChange(val) {
      this.tableChecked = val
    },
    currentPage() {},
    handlePreview(e) {
      console.log('handlePreview')
      console.log(e)
    },
    handleExceed(e) {
      console.log('handleExceed')
      console.log(e)
    },
    // 上传文件
    uploadFile(item) {
      // console.log(item)
      const file = item.file
      // FormData 对象
      const formdata = new FormData()
      // 文件对象
      formdata.append('xlsx', file)
      this.upload_loading = true
      this.$request.request({
        url: '/admin/stage/uploadHouseExcel',
        timeout: 1000 * 60,
        method: 'post',
        data: formdata
      }).then((res) => {
        // console.log(res.data)
        // this.form.textarea = res.data.join('\n')
        this.$message({
          message: '导入完成',
          type: 'success'
        })
        this.get_data()
        this.upload_loading = false
      }).catch(() => {
        this.upload_loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped="">
.app-container{ position: absolute; padding-left: 330px; right: 0; left: 0; height: 100%; box-sizing: box-border;  }
.area{ width: 300px; position: absolute; left: 0; top: 0; bottom: 0; border-right: 1px solid #e6e6e6; padding: 15px; overflow: auto; }
.stage{ position: absolute; left: 320px; right: 20px; top: 20px; bottom: 20px; overflow: auto;}
.header{ margin-bottom: 15px; height: 28px;}
</style>
