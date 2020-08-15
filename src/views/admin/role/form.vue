<template>
  <div class="app-container">
    <el-form v-loading="loading" ref="form" :rules="rules" :model="form" label-width="80px" >
      <el-form-item label="角色名" prop="role_name">
        <el-input v-model="form.role_name" placeholder="请输入用户名" auto-complete="off"/>
      </el-form-item>
      <el-form-item label="设置权限" >
        <div v-for="(item,index) in auth" :key="index" >
          <div v-if="item.show || item.pid === 0">
            <i v-if="index < (auth.length - 1) && auth[index + 1].pid === item.id" :class="[item.show_child ? 'el-icon-arrow-down' : 'el-icon-arrow-right']" class="btn" style="width:15px; display: inline-block;" @click="click_show_child(item)" />
            <i v-else class="el-icon-arrow-right" style="color:#d6d6d6;" />
            <el-checkbox v-model="item.status" :checked="Boolean(item.status)" :key="index" @change="change_auth(index)">{{ item.auth_name }}</el-checkbox>
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('form')">保存</el-button>
        <el-button @click="$router.go(-1)">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: 0,
      form: {},
      role_option: [], // 角色列表
      rules: {
        role_name: [
          { required: true, message: '请输角色名', trigger: 'blur' }
        ]
      },
      auth: [],
      loading: false
    }
  },
  created() {
    this.id = this.$route.params.id ? this.$route.params.id : 0
    this.get_data()
  },
  methods: {
    click_show_child(item) {
      // console.log(item)
      this.$set(item, 'show_child', !item.show_child)
      this.show_child(item.id, item.show_child)
    },
    show_child(pid, show) {
      this.auth.forEach(item => {
        if (item.pid === pid) {
          item.show = show
        }
      })
    },
    change_auth(index) {
      const auth = this.auth[index] // 获取点击的那个复选框的所有数据
      this.update_subset_select(auth) // 更新子集的选中状态
      this.update_parent_select(auth.pid) // 更新父级的选中状态
      this.set_form_auth_ids() // 遍历选中所有父级权限
    },
    // 更新子集的选中状态
    update_subset_select(auth) { // 这个是 选父级 子集改变
      this.auth.forEach(item => {
        if (item.pid === auth.id) { // 如果子集的pid 等于 父级的id 那么就给他选中
          item.status = auth.status
          this.update_subset_select(item) // 因为层次有三级所以向下 再运行一次
        }
      })
    },
    // 更新父级的选中状态
    update_parent_select(pid) { // 这个是 选子集 父级改变
      let has_subset = false // 是否有子集
      this.auth.forEach(item => { // 遍历查询当前父级下是否有被选中的子集
        if (item.status === true && item.pid === pid) {
          has_subset = true
        }
      })
      this.auth.forEach(item => {
        if (item.id === pid) { // 如果父级的id和pid相等就选中
          item.status = has_subset
          if (item.pid !== 0) { // 如果该父级 不是 0 说明他 之上 还有父级  在循环一次
            this.update_parent_select(item.pid)
          }
        }
      })
    },
    // 根据当前权限列表的选中状态 设置表单的auth_ids值
    set_form_auth_ids() {
      const auth_ids = []
      this.auth.forEach(item => { // 遍历渲染出的角色表单数据 如果你选了一些复选框
        if (item.status) {
          auth_ids.push(item.id) // 选中的复选框绑定的id 存到一个备用数组
        }
      })
      this.form.auth_ids = auth_ids // 遍历完 通过给角色update 接口的字段auth_ids 接收 选中的id 完成修改
    },
    get_data() {
      this.loading = true
      const data = { id: this.id }
      this.$request.post('/admin/admin_role/getFormData', data).then((res) => {
        this.loading = false
        this.role_option = res.data.role_list
        this.auth = res.data.auth
        if (this.id) {
          const form = res.data.form
          this.form = form
          for (var i in form.auth_ids) {
            form.auth_ids[i] = Number(form.auth_ids[i])
          }
          this.form.id = this.id
        }
      }).catch(() => {
        this.loading = false
      })
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const url = this.id ? '/admin/admin_role/update' : '/admin/admin_role/append'

          const data = JSON.parse(JSON.stringify(this.form))
          // console.log(data)
          this.$request.post(url, data).then((res) => {
            let cancelButtonText = '继续添加'
            if (this.id) {
              cancelButtonText = '继续修改'
            }
            this.$confirm(res.msg, '提示', {
              confirmButtonText: '返回上页',
              cancelButtonText,
              type: 'success'
            }).then(() => {
              this.$router.go(-1)
            }).catch(() => {
              if (!this.id) {
                this.form = {}
              }
            })
          }).catch(() => {
          })
        } else {
          return false
        }
      })
    },
    password(value) {
      console.log(this.form.password)
    }
  }
}
</script>
