<template>
  <div class="app-container">
    <el-form v-loading="loading" ref="form" :model="form" label-width="80px">
      <el-form-item label="权限名称" prop="auth_name">
        <el-input v-model="form.auth_name"/>
      </el-form-item>
      <el-form-item label="父级权限" prop="pid">
        <el-select v-model="form.pid" placeholder="请选择权限" clearable>
          <el-option :value="Number(0)" label="无" />
          <el-option v-for="item in auth_options" :key="item.id" :label="item.label" :value="item.id" :disabled="!item.status"/>
        </el-select>
      </el-form-item>
      <el-form-item label="接口路径" prop="path">
        <el-input v-model="form.path"/>
      </el-form-item>
      <el-form-item label="路由" prop="router">
        <el-input v-model="form.router"/>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="form.sort"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('form')">保存</el-button>
        <el-button @click="$router.go(-1)">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { tree } from '@/utils/tool'
export default {
  data() {
    return {
      id: 0,
      form: {
        sort: 0,
        auth_name: '',
        router: '',
        path: ''
      },
      auth_options: [],
      loading: false
    }
  },
  created() {
    this.id = this.$route.params.id ? this.$route.params.id : 0
    this.get_data()
  },
  methods: {
    get_data() {
      this.loading = true
      const data = { id: this.id }
      this.$request.post('/admin/auth/getFormData', data).then((res) => {
        this.loading = false
        this.auth_options = tree(res.data.auth, 'auth_name')
        if (this.id) {
          this.form = res.data.form_data
          this.form.id = this.id
        }
      }).catch(() => {
        this.loading = false
      })
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const url = this.id ? '/admin/auth/update' : '/admin/auth/append'
          this.$request.post(url, this.form).then((res) => {
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
    }
  }
}
</script>

<style scoped>

</style>
