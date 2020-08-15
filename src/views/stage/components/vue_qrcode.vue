<template>
  <el-dialog :visible.sync="dialog_visible" :title="title" :close-on-click-modal="false" class="activation_dialog">
    <qrcode v-model="id" :options="{ size: 300 }"/>
  </el-dialog>
</template>

<script>
import qrcode from '@xkeshi/vue-qrcode'
export default {
  components: { qrcode },
  data() {
    return {
      id: 0,
      title: '',
      dialog_visible: false
    }
  },
  methods: {
    init({ id, title }) {
      this.id = id
      this.title = title
      this.dialog_visible = true
    }
  }
}
</script>
