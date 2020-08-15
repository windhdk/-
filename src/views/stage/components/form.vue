<template>
  <div>
    <el-dialog :visible.sync="dialog_visible" :title="title" :close-on-click-modal="false" class="activation_dialog" >
      <el-form v-loading="loading" ref="form" :rules="rules" :model="form" label-width="80px" >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name"/>
        </el-form-item>
        <el-form-item label="缩略图" prop="thumbnail">
          <el-upload :show-file-list="false" :on-success="handle_thumbnail_success" class="avatar-uploader" action="/admin/index/upload">
            <div v-if="form.thumbnail" class="avatar">
              <img :src="form.thumbnail_url">
              <div class="del btn" @click.stop="form.thumbnail = '';form.thumbnail_url = ''">
                <i class="icon el-icon-close"/>
              </div>
            </div>
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
        </el-form-item>
        <!-- <el-form-item label="省市区" prop="area">
          <el-cascader v-model="form.area" :options="area_options" :props="props" style="width:300px;" clearable/>
        </el-form-item> -->
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address"/>
        </el-form-item>
        <el-form-item label="驿站详情" prop="content" style="margin-bottom: 30px;">
          <ue ref="editor" :height="400" v-model="form.content" />
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
import area_options from '@/assets/json/area-data.json'
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
      loading: false,
      area_options,
      props: {
        value: 'label'
      }
    }
  },
  methods: {
    init({ id, title, area_data }) {
      this.title = title || ''
      this.id = id || 0
      if (this.id) {
        this.get_data()
      } else {
        this.form = {}
        this.form.province = area_data.province
        this.form.city = area_data.city
        this.form.district = area_data.district
        this.form.town = area_data.town
        this.form.village = area_data.village
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
      this.$request.post('/admin/stage/getFormData', data).then((res) => {
        this.loading = false
        if (this.id) {
          const form = res.data.form
          console.log(form)
          form.area = []
          form.area[0] = form.province
          form.area[1] = form.city
          form.area[2] = form.district
          console.log(form)
          this.form = form
        }
      }).catch(() => {
        this.loading = false
      })
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const url = this.id ? '/admin/stage/update' : '/admin/stage/append'
          const param = {}
          param.form = this.form
          if (this.id) {
            param.id = this.id
          }
          // param.form.province = this.form.area[0]
          // param.form.city = this.form.area[1]
          // param.form.district = this.form.area[2]
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
    handle_thumbnail_success(file) {
      this.$set(this.form, 'thumbnail_url', file.data.file_url)
      this.$set(this.form, 'thumbnail', file.data.file_path)
    }
  }
}
</script>
