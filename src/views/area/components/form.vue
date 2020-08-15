<template>
  <div>
    <el-dialog :visible.sync="dialog_visible" :title="title" :close-on-click-modal="false" class="activation_dialog" >
      <el-form v-loading="loading" ref="form" :rules="rules" :model="form" label-width="80px" >
        <el-form-item label="名称" prop="area_name">
          <el-input v-model="form.area_name"/>
        </el-form-item>
        <el-form-item label="父栏目" prop="parent_id">
          <el-input v-model="form.parent_id"/>
        </el-form-item>
        <el-form-item label="是否显示">
          <el-input v-model="form.show"/>
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
      id: 0,
      form: {},
      rules: {
        area_name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      loading: false,
      props: {
        value: 'label'
      }
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
        area_name: '',
        sort: 0
      }
    },
    get_data() {
      this.loading = true
      const data = { id: this.id }
      console.log(data)
      this.$request.post('/admin/area/getFormData', data).then((res) => {
        this.loading = false
        if (this.id) {
          this.form = res.data.form
        }
      }).catch(() => {
        this.loading = false
      })
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const url = '/admin/area/update'
          const param = {}
          param.form = this.form
          param.id = this.id
          console.log(param)
          this.$request.post(url, param).then((res) => {
            this.$emit('reload')
            const cancelButtonText = '继续修改'
            this.$confirm(res.msg, '提示', {
              confirmButtonText: '返回上页',
              cancelButtonText,
              type: 'success'
            }).then(() => {
              this.dialog_visible = false
            }).catch(() => {
              if (!this.id) {
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
