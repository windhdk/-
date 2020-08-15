<template>
  <div>
    <el-dialog :visible.sync="dialog_visible" :title="title" :close-on-click-modal="false" class="activation_dialog" >
      <el-form v-loading="loading" ref="form" :rules="rules" :model="form" label-width="80px" >
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="建议">教室</el-radio>
            <el-radio label="投诉">办公室</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="建议详情" prop="content" style="margin-bottom: 30px;">
          <el-input v-model="form.content" type="textarea" placeholder="请输入内容" disabled/>
        </el-form-item>
        <el-form-item>
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
import ue from '@/components/ue'

export default {
  components: { ue },
  data() {
    return {
      dialog_visible: false,
      title: '',
      id: 0,
      form: {},
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      videoUploading: false, // 是否在上传
      videoUploadPercent: 0, // 进度条值
      loading: false
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
        type: '建议',
        content: '',
        uid: '',
        sort: 0
      }
    },
    get_data() {
      this.loading = true
      const data = { id: this.id }
      this.$request.post('/admin/suggest/getFormData', data).then((res) => {
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
          const url = this.id ? '/admin/suggest/update' : '/admin/suggest/append'
          const param = {}
          param.form = this.form
          if (this.id) {
            param.id = this.id
          }
          this.$request.post(url, param).then((res) => {
            this.$emit('reload')
            let cancelButtonText = '继续添加'
            if (this.id) {
              cancelButtonText = '继续修改'
            }
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
