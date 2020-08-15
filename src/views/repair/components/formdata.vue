<template>
  <div>
    <el-dialog :visible.sync="dialog_visible" :title="title" :close-on-click-modal="false" class="activation_dialog" >
      <el-form v-loading="loading" ref="form" :rules="rules" :model="form" label-width="80px" >
        <el-form-item label="地点" prop="place">
          <el-input v-model="form.place" disabled/>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="教室">教室</el-radio>
            <el-radio label="办公室">办公室</el-radio>
            <el-radio label="实训室">实训室</el-radio>
            <el-radio label="学生公寓">学生公寓</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="缩略图" prop="thumbnail">
          <div>
            <img :lazy="true" :src="form.thumbnail_url" style="width: 300px; height: 300px">
          </div>
        </el-form-item>
        <el-form-item label="报修详情" prop="content" style="margin-bottom: 30px;">
          <el-input v-model="form.content" type="textarea" autosize disabled/>
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
        type: '',
        place: '',
        content: '',
        srcList: [],
        uid: '',
        sort: 0
      }
    },
    get_data() {
      this.loading = true
      const data = { id: this.id }
      this.$request.post('/admin/Info_Repair/getFormData', data).then((res) => {
        if (this.id) {
          this.form = res.data.form
          console.log(this.form)
          this.loading = false
        }
      }).catch(() => {
        this.loading = false
      })
    },
    // 上传缩略图
    handle_thumbnail_success(file) {
      this.$set(this.form, 'thumbnail_url', file.data.file_url)
      this.$set(this.form, 'thumbnail', file.data.file_path)
    }
  }
}
</script>
