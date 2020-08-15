<template>
  <div>
    <el-dialog :visible.sync="dialog_visible" :title="title" :close-on-click-modal="false" class="activation_dialog" >
      <el-form v-loading="loading" ref="form" :rules="rules" :model="form" label-width="80px" >
        <el-form-item label="标题" prop="name">
          <el-input v-model="form.name"/>
        </el-form-item>
        <el-form-item label="缩略图" prop="image">
          <el-upload :show-file-list="false" :on-success="handle_image_success" class="avatar-uploader" action="/admin/index/upload" >
            <div v-if="form.image" class="avatar">
              <img :src="form.image_url">
              <div class="del btn" @click.stop="form.image = '';form.image_url = ''">
                <i class="icon el-icon-close"/>
              </div>
            </div>
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
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
        name: '',
        video: '',
        sort: 0
      }
    },
    get_data() {
      this.loading = true
      const data = { id: this.id }
      this.$request.post('/admin/banner/getFormData', data).then((res) => {
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
          const url = this.id ? '/admin/banner/update' : '/admin/banner/append'
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
    },
    // 上传缩略图
    handle_image_success(file) {
      this.$set(this.form, 'image_url', file.data.file_url)
      this.$set(this.form, 'image', file.data.file_path)
    }
  }
}
</script>
