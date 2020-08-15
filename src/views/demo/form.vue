<template>
  <div class="app-container">
    <el-form v-loading="loading" ref="form" :rules="rules" :model="form" label-width="80px" >
      <el-form-item label="标题" prop="name">
        <el-input v-model="form.name"/>
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author"/>
      </el-form-item>
      <el-form-item label="视频上传" prop="video">
        <el-upload :show-file-list="false" :on-success="handleVideoSuccess" :before-upload="beforeUploadVideo" :on-progress="uploadVideoProcess" action="/admin/index/upload" drag class="upload-demo">
          <video v-if="form.video != '' && videoUploading == false" :src="form.video_url" controls="controls" class="avatar" style="height:100%;">您的浏览器不支持视频播放</video>
          <span v-else-if="form.video =='' && videoUploading == false">
            <i class="el-icon-upload"/>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </span>
          <el-progress v-if="videoUploading == true" :percentage="videoUploadPercent" type="circle" style="margin-top:30px;"/>
          <div slot="tip" class="el-upload__tip">请保证视频格式正确，且不超过10M</div>
        </el-upload>
      </el-form-item>
      <el-form-item label="详情" prop="content" style="margin-bottom: 30px;">
        <Tinymce ref="editor" :height="400" v-model="form.content"/>
      </el-form-item>
      <el-form-item label="排序">
        <el-input v-model="form.sort"/>
      </el-form-item>
      <el-form-item>
        <el-button size="small" type="primary" @click="onSubmit('form')">保存</el-button>
        <el-button size="small" @click="$router.go(-1)">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
export default {
  components: { Tinymce },
  data() {
    return {
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
  created() {
    this.id = this.$route.params.id ? this.$route.params.id : 0
    this.init()
  },
  methods: {
    init() {
      this.init_form()
      this.get_data()
    },
    init_form() {
      this.form = {
        name: '',
        video: '',
        sort: 0
      }
    },
    // 视频上传: 验证视频格式和视频大小
    beforeUploadVideo(file) {
      if (['video/mp4', 'video/ogg', 'video/flv', 'video/avi', 'video/wmv', 'video/rmvb'].indexOf(file.type) === -1) {
        this.$message.error('请上传正确的视频格式')
        return false
      }
    },
    // 视频上传: 上传进度显示
    uploadVideoProcess(event, file, fileList) {
      this.videoUploading = true
      console.log(file.percentage)
      this.videoUploadPercent = Number(file.percentage.toFixed(0))
    },
    // 视频上传: 上传成功
    handleVideoSuccess(res, file) {
      this.videoUploading = false
      this.videoUploadPercent = 0
      if (res.status === true) {
        console.log(res)
        console.log(file)
        this.form.video_url = res.data.file_url
        this.form.video = res.data.file_path
      } else {
        this.$message.error('视频上传失败，请重新上传！')
      }
    },
    get_data() {
      this.loading = true
      const data = { id: this.id }
      this.$request.post('/admin/demo/getFormData', data).then((res) => {
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
          const url = this.id ? '/admin/demo/update' : '/admin/demo/append'
          const param = {}
          param.form = this.form
          if (this.id) {
            param.id = this.id
          }
          this.$request.post(url, param).then((res) => {
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
