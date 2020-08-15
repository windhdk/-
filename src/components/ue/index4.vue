<template>
  <div>
    <script :id="id" type="text/plain"/>
  </div>
</template>

<script>
import '@/../static/lib/u_editor/ueditor.config'
import '@/../static/lib/u_editor/ueditor.all'
import '@/../static/lib/u_editor/lang/zh-cn/zh-cn'
import '@/../static/lib/u_editor/ueditor.parse.min.js'
export default {
  name: 'Editor',
  props: {
    id: {
      type: String,
      default: function() {
        return 'ue-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')
      }
    },
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      editor: null
    }
  },
  mounted() {
    // 初始化UE
    this.autoHeightEnabled = false
    this.config.initialFrameWidth = this.config.initialFrameWidth !== undefined ? this.config.initialFrameWidth : null
    this.config.initialFrameHeight = this.config.initialFrameHeight !== undefined ? this.config.initialFrameHeight : 600
    this.editor = UE.getEditor(this.id, this.config) // eslint-disable-line
  },
  destroyed() {
    this.editor.destroy()
  },
  methods: {
    getContent() {
      return this.editor.getContent()
    },
    setContent(content) {
      this.editor.ready(res => {
        this.editor.setContent(content)
      })
    }
  }
}
</script>

<style scoped>

</style>
