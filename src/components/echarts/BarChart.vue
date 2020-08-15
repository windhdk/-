<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme

// const animationDuration = 6000

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    window.addEventListener('resize', this.repaint) // 监听浏览器的size是否发生变化 变化就重绘
  },
  methods: {
    repaint() {
      if (this.chart) {
        this.chart.resize() // 重绘
      }
    },
    initChart(form) {
      // this.chart_list = form
      // console.log(this.chart_list)
      // console.log(form)
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption(form)
    }
  }
}
</script>
