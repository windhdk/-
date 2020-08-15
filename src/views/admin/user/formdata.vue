<template>
  <div>
    <el-dialog :visible.sync="dialog_visible" :title="title" :close-on-click-modal="false" class="activation_dialog" >
      <el-form v-loading="loading" ref="form" :rules="rules" :model="form" label-width="120px" >
        <el-form-item label="管理员账号" prop="id">
          <el-input v-model="form.id" placeholder="请输入管理员名称" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="姓名" prop="username">
          <el-input v-model="form.username" placeholder="请输入管理员姓名"/>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入管理员联系方式"/>
        </el-form-item>
        <el-form-item label="管理员身份" prop="router_auth" >
          <el-radio-group v-model="form.router_auth">
            <el-radio label="admin">超级管理员</el-radio>
            <el-radio label="editor">普通管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status" >
          <el-radio-group v-model="form.status">
            <el-radio :label="1">可用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('form')">保存</el-button>
          <el-button @click="$router.go(-1)">返回</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import md5 from 'js-md5'
export default {
  data() {
    return {
      dialog_visible: false,
      id: 0,
      title: '',
      form: {},
      role_option: [], // 角色列表
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        role_id: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        phone: [
          { required: true, message: '手机号码格式不正确', pattern: /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/, trigger: 'change' }
        ],
        password: [
          { required: false, message: '请输入密码', trigger: 'blur' },
          {
            pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/g, message: '请输入6~16个字符，区分大小写'
          }
        ],
        c_password: [
          { required: false, validator: this.Pwd, trigger: 'blur' }
        ]
      },
      loading: false,
      router_auth: []
    }
  },
  created() {
    this.id = this.$route.params.id ? this.$route.params.id : 0
    this.get_data()
    if (!this.id) {
      const validate_cpassword = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入确认密码'))
        }
        if (value !== this.form.password) {
          callback(new Error('确认密码不正确'))
        }
        callback()
      }
      this.rules.password = [
        { required: false, message: '请输入登陆密码', trigger: 'blur' }
      ]
      this.rules.c_password = [
        { required: false, trigger: 'blur', validator: validate_cpassword }
      ]
    }
  },
  methods: {
    init(obj) {
      obj = obj || {}
      this.title = obj.title || ''
      this.id = obj.id ? obj.id : 0
      this.init_form(obj.form)
      if (this.id) {
        this.get_data()
      }
      this.dialog_visible = true
    },
    init_form(form) {
      this.form = form || {
        username: '',
        id: '',
        status: '',
        c_password: '',
        password: '',
        router_auth: 'editor',
        phone: '',
        sort: 0
      }
    },
    get_data() {
      this.loading = true
      const data = { id: this.id }
      this.$request.post('/admin/admin/getFormData', data).then((res) => {
        this.loading = false
        if (this.id) {
          const form = res.data.form
          this.form = form
          console.log(form)
          this.loading = false
        }
      }).catch(() => {
        this.loading = false
      })
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const url = this.id ? '/admin/admin/update' : '/admin/admin/append'

          const data = JSON.parse(JSON.stringify(this.form))
          if (data.password) {
            data.password = md5(data.password)
          } else {
            delete data.password
          }
          delete data.c_password
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
      // console.log(this.form.password)
    },
    Pwd(rule, value, callback) {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
  }
}
</script>
