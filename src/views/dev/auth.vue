<template>
  <div class="app-container">
    <div class="header demo-input-suffix">
      <span style="float:right;">
        <el-button-group>
          <el-button type="primary" icon="el-icon-refresh" size="mini" style="height:28px;" @click="get_data"/>
          <el-button type="primary" size="mini" @click="$router.push( { name: 'append_auth' } )">添加权限</el-button>
        </el-button-group>
      </span>
    </div>
    <el-table v-loading="loading" :data="tree" row-key="id" style="width: 100%;" border>
      <el-table-column prop="auth_name" label="名称"/>
      <el-table-column prop="path" label="接口路径"/>
      <el-table-column prop="router" label="路由"/>
      <el-table-column prop="sort" label="操作" width="180" >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="$router.push({name: 'edit_auth', params: {id: scope.row.id}})">编辑</el-button>
          <el-popover v-model="scope.row.visible" placement="top" width="60">
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      auth: [],
      tree: []
    }
  },
  created() {
    this.get_data()
  },
  methods: {
    getRowKeys(row) {
      // console.log(row)
      return row.id
    },
    get_data() {
      this.loading = true
      this.$request.post('/admin/auth/getListData').then(res => {
        this.auth = res.data.auth
        // console.log(this.auth.length)
        const tree = [] // 父级
        this.auth.forEach(item => {
          if (item.pid === 0) {
            tree.push(item)
          }
        })
        this.tree_data(tree)
        // console.log(this.tree)
        this.loading = false
        // console.log(res)
      }).catch(() => {
        this.loading = false
        // console.log(error)
      })
    },
    del(item) {
      item.visible = false
      const data = { id: item.id }
      this.$request.post('/admin/auth/delete', data).then((res) => {
        this.$message({
          message: res.msg,
          type: 'success'
        })
        this.get_data()
      })
    },
    tree_data(tree) {
      // console.log(tree)
      tree.forEach(i => { // 递归
        // console.log(i)
        const children = []
        this.auth.forEach(j => {
          if (j.pid === i.id) {
            // console.log(i)
            // console.log(j)
            children.push(j)
            i['children'] = children
            // i['hasChildren'] = true
            this.tree_data(children)
          }
        })
      })
      this.tree = tree
      // console.log(this.tree)
    }
  }
}
</script>
