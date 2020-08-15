<template>
  <div class="dashboard-container">
    <panel-group @handleSetLineChartData="handleSetLineChartData" />
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <span>各月份的维修数量分布图</span>
      <line-chart :chart-data="lineChartData" />
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import LineChart from './components/LineChart'
import PanelGroup from './components/PanelGroup'

const lineChartData = {
  newVisitis: {
    actualData: []
  }
}

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    PanelGroup
  },
  data() {
    return {
      lineChartData: lineChartData.newVisitis
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.get_data()
    },
    get_data() {
      this.$request.post('/admin/admin/getData', this.param).then((res) => {
        this.data = res.data
        lineChartData.newVisitis.actualData = this.data['everyMonth']
        console.log(this.data['everyMonth'])
        // this.param.page = res.data.list.current_page
      }).catch(() => {
        console.log('error')
      })
    },
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
