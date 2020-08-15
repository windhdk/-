<template>
  <div v-loading="loading" class="app-container">
    <div class="header demo-input-suffix">
      <el-form ref="form" :model="form" :rules="rules" label-width="180px" >
        <el-form-item label="新密码" prop="newpassword">
          <el-col :span="12">
            <el-input v-model="form.newpassword" placeholder="请输入新密码" type="password"/>
          </el-col>
        </el-form-item>
        <el-form-item label="重复新密码" prop="checknewpassword">
          <el-col :span="12">
            <el-input v-model="form.checknewpassword" placeholder="请再次输入新密码" type="password"/>
          </el-col>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="onSubmit('form')">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.newpassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      form: {
        newpassword: '',
        checknewpassword: ''
      },
      rules: {
        newpassword: [{ required: true, message: '请输入新密码' }],
        checknewpassword: [{ required: true, validator: validatePass2, trigger: 'blur' }]
      },
      loading: false
    }
  },
  methods: {
    onSubmit(formName) {
      this.loading = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const url = '/admin/admin/updatepassword'
          const param = {}
          param.form = this.form
          console.log(this.form)
          this.$request.post(url, param).then((res) => {
            this.$confirm(res.msg, '提示', {
              confirmButtonText: '确定',
              type: 'success'
            }).then(() => {
              this.loading = false
            }).catch(() => {
              this.loading = false
              console.log('修改失败')
            })
          }).catch(() => {
            this.loading = false
            console.log('修改失败')
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped="">
.header{ margin-bottom: 15px; height: 28px; margin-left: 250px }
</style>
