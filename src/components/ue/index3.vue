<template>
  <div>
    <script :id="tinymceId" type="text/plain"/>
  </div>
</template>

<script>
// import './ueditor.config'
// import './ueditor.all'
// import './lang/zh-cn/zh-cn'
// import './ueditor.parse.min.js'
export default {
  name: 'Editor',
  props: {
    id: {
      type: String,
      default: function() {
        return 'ue-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')
      }
    },
    value: {
      type: String,
      default: ''
    },
    menubar: {
      type: String,
      default: 'file edit insert view format table'
    },
    height: {
      type: Number,
      required: false,
      default: 360
    },
    width: {
      type: Number,
      required: false,
      default: 0
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
      hasChange: false,
      hasInit: false,
      hasDestroy: false,
      tinymceId: this.id,
      fullscreen: false,
      languageTypeList: {
        'en': 'en',
        'zh': 'zh_CN'
      }
    }
  },
  computed: {
    language() {
      return this.languageTypeList[this.$store.getters.language]
    }
  },
  watch: {
    value(val) {
      if (!this.hasChange && this.hasInit) {
        this.$nextTick(() =>
          this.editor.setContent(val)
        )
      }
    },
    language() {
      this.editor.destroy()
      this.$nextTick(() => this.init())
    }
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  deactivated() {
    if (this.hasInit) {
      this.hasDestroy = true
      this.editor.destroy()
    }
  },
  destroyed() {
    if (this.hasInit) {
      this.hasDestroy = true
      this.editor.destroy()
    }
  },
  methods: {
    init() {
      // 初始化UE
      this.autoHeightEnabled = false
      this.config.initialFrameWidth = this.width ? this.width : null
      this.config.initialFrameHeight = this.height
      this.editor = UE.getEditor(this.tinymceId, this.config) // eslint-disable-line
      this.$nextTick(() => {
        this.editor.addListener('ready', () => {
          this.hasInit = true
          // this.editor.setContent(this.value) // 确保UE加载完成后，放入内容。
        })
      })

      // this.editor.addListener('contentChange', () => {
      //   if (this.value) {
      //     this.hasChange = true
      //   }
      //   this.$emit('input', this.getContent())
      // })
      // this.editor.addListener('firstBeforeExecCommand', () => {
      //   console.log(this.getContent())
      //   // this.$emit('input', this.getContent())
      // })
    },
    setContent(value) {
      this.editor.setContent(value)
    },
    getContent() {
      return this.editor.getContent()
    }
  }

  // mounted () {
  //   //初始化UE
  //   const _this = this;
  //   this.autoHeightEnabled = false
  //   this.config.initialFrameWidth = this.config.initialFrameWidth != undefined ? this.config.initialFrameWidth : null
  //   this.config.initialFrameHeight = this.config.initialFrameHeight != undefined ? this.config.initialFrameHeight : 600
  //   this.editor = UE.getEditor('editor',this.config)
  // },
  // methods: {
  //   getUEContent () {
  //     return this.editor.getContent()
  //   },
  //   setUEContent(content){
  //     this.editor.ready(res => {
  //       this.editor.setContent(content);
  //     });
  //   }
  // },
  // destroyed () {
  //   this.editor.destroy()
  // }
}
</script>

<style scoped>

</style>
