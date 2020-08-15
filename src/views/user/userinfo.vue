<template>
  <div>
    <el-dialog :visible.sync="dialog_visible" :title="title" :close-on-click-modal="false" class="activation_dialog" >
      <el-form v-loading="loading" ref="form" :rules="rules" :model="form" label-width="80px" >
        <el-form-item label="姓名" prop="username">
          <el-input v-model="form.username"/>
        </el-form-item>
        <el-form-item label="班级" prop="class">
          <el-input v-model="form.class"/>
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="form.major"/>
        </el-form-item>
        <el-form-item label="学院" prop="college">
          <el-input v-model="form.college"/>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :label="0">男</el-radio>
            <el-radio :label="1">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="form.sort"/>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="onSubmit('form')">保存</el-button>
          <el-button size="small" @click="dialog_visible = false">返回</el-button>
        </el-form-item>
      </el-form>
      <!-- <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialog_visible = false">取 消</el-button>
        <el-button v-loading="loading" type="primary" size="mini" @click="onSubmit('form')">保 存</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialog_visible: false,
      title: '',
      form: {},
      rules: {
        username: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        class: [
          { required: true, message: '请输入班级', trigger: 'blur' }
        ],
        college: [
          { required: true, message: '请输入学院', trigger: 'blur' }
        ],
        major: [
          { required: true, message: '请输入专业', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    init(obj) {
      obj = obj || {}
      this.title = obj.title || ''
      this.uid = obj.uid ? obj.uid : 0
      console.log(this.uid)
      this.init_form(obj.form)
      if (this.uid) {
        this.get_data()
      }
      this.dialog_visible = true
    },
    init_form(form) {
      this.form = form || {
        gender: '0',
        password: '',
        college: '',
        uid: '',
        major: '',
        username: '',
        class: '',
        sort: 0
      }
    },
    get_data() {
      this.loading = true
      const data = { uid: this.uid }
      this.$request.post('/admin/user/getFormData', data).then((res) => {
        this.loading = false
        if (this.uid) {
          this.form = res.data.form
        }
      }).catch(() => {
        this.loading = false
      })
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const url = this.uid ? '/admin/user/update' : '/admin/user/append'
          const param = {}
          param.form = this.form
          if (this.uid) {
            param.uid = this.uid
          }
          this.$request.post(url, param).then((res) => {
            this.$emit('reload')
            let cancelButtonText = '继续添加'
            if (this.uid) {
              cancelButtonText = '继续修改'
            }
            this.$confirm(res.msg, '提示', {
              confirmButtonText: '返回上页',
              cancelButtonText,
              type: 'success'
            }).then(() => {
              this.dialog_visible = false
            }).catch(() => {
              if (!this.uid) {
                this.init()
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
<style lang="scss" scoped>
.userinfo{
  height: 500px; overflow: auto; padding: 10px; position: relative;
  .box-card{
    margin-top: 10px;
  }
  .item{
    line-height: 30px;
  }
}
</style>
