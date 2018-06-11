<template>
  <div class="fans">
    <div class="echarts-date-picker">
      <el-date-picker
        v-model="dateRate"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        @change="dateChange">
      </el-date-picker>
    </div>
    <div class="echarts-box">
      <div id="main" style="width: 720px; height: 340px;"></div>
      <div class="echarts-rightbar">
        <div class="echarts-rightbar__item">
          <div class="echarts-rightbar__item--title">粉丝总数</div>
          <div v-text="fansTotal.total"></div>
        </div>
        <div class="echarts-rightbar__item">
          <div class="echarts-rightbar__item--title">粉丝增加总数</div>
          <div v-text="fansTotal.incr"></div>
        </div>
        <div class="echarts-rightbar__item">
          <div class="echarts-rightbar__item--title">粉丝减少总数</div>
          <div v-text="fansTotal.decr"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/bar');
require('echarts/lib/chart/line');
require('echarts/lib/component/tooltip');
require('echarts/lib/component/toolbox');
require('echarts/lib/component/legend');
require('echarts/lib/component/legendScroll');
require('echarts/lib/component/markLine');

require('./fans.css');

export default {
  name: 'Fans',
  data() {
    return {
      fansTotal: {
        total: 0,
        incr: 0,
        decr: 0,
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 7));
            picker.$emit('pick', [start, end]);
          },
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 30));
            picker.$emit('pick', [start, end]);
          },
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 90));
            picker.$emit('pick', [start, end]);
          },
        }],
      },
      dateRate: '',
      myChart: '',
    };
  },
  mounted() {
    let end = parseInt(new Date().getTime() / 1000, 10);
    end -= 86400;
    let start = end - (7 * 24 * 3600);
    start = new Date(start * 1000);
    end = new Date(end * 1000);
    this.load(this.format(start, 'yyyy-MM-dd'), this.format(end, 'yyyy-MM-dd'));
  },
  methods: {
    load(start, end) {
      const self = this;
      axios
        // http://dss.sc.weibo.com
        .get(`${this.global.weiboApi}/pc/aj/chart/fans/fansTrend`, {
          params: {
            starttime: start,
            endtime: end,
            // uid: this.global.weiboUid,
            // oauth_token: '',
          },
        })
        .then((res) => {
          const data = res.data;
          // console.log(data);
          if (data.code === 100000) {
            self.init(data.data.chart);
          } else {
            // alert(JSON.stringify(data));
          }
        })
        .catch(() => {
          // alert(String(error));
        });
    },
    rightbar(data) {
      this.fansTotal = data;
    },
    init(xdata) {
      const data = xdata.fansTrend;
      const self = this;
      self.rightbar({
        total: data.fansTotal,
        incr: data.incrTotal,
        decr: data.descTotal,
      });
      this.$nextTick(() => {
        if (!self.myChart) {
          self.myChart = echarts.init(document.getElementById('main'));
        }
        const legend = {
          粉丝总数: true,
          粉丝增加总数: true,
          粉丝增长率: false,
          粉丝减少总数: true,
          粉丝减少率: false,
          // 主动取关粉丝数: false,
        };
        // const fansData = {
        //   total: [],
        //   incr: [],
        //   incrRate: [],
        //   decr: [],
        //   decrRate: [],
        //   unfollow: [],
        //   // cur off
        //   totalMax: 0,
        //   incrMax: 0,
        //   decrMax: 0,
        // };
        const fansData = data;
        const xData = [];
        // const count = data.fansTotal;
        const legends = Object.keys(legend);
        const startTimestamp = parseInt(new Date(data.starttime).getTime() / 1000, 10);
        for (let i = 0; i < data.incrTrend.length; i += 1) {
        //   const incr = Number(data.list_data[i].followers_incr);
        //   const decr = Number(data.list_data[i].followers_decr);
        //   fansData.totalMax += (incr + decr);
        //   fansData.incrMax += incr;
        //   fansData.decrMax += decr;
          const json = {
            timestamp: startTimestamp + (i * 86400),
          };
          if (data.incrTrend.length <= 5) {
            json.show = true;
          } else if ((i + 3) % 5 === 0) {
            json.show = true;
          }
          xData.push(JSON.stringify(json));
        //   fansData.incr.push(incr);
        //   fansData.incrRate.push(Math.round((incr / count) * 10000) / 100);
        //   fansData.decr.push(decr);
        //   fansData.decrRate.push(Math.round((decr / count) * 10000) / 100);
        //   fansData.total.push(fansData.totalMax);
        }
        let yMax = Math.max(data.incrTotal, data.descTotal);
        yMax = self.rateMax(yMax);
        const yInterval = self.rateNum(yMax);
        // console.log(fansData.incrTrend);
        // console.log(fansData.descTrend);
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              crossStyle: {
                color: '#999',
              },
              label: {
                formatter(xcrossData) {
                  if (typeof xcrossData.value === 'number') {
                    return xcrossData.value.toFixed(2);
                  }
                  let xcrossDataJson;
                  try {
                    xcrossDataJson = JSON.parse(xcrossData.value);
                  } catch (err) {
                    xcrossDataJson = {};
                  }
                  return self.format(new Date(xcrossDataJson.timestamp * 1000), 'MM月dd日');
                },
              },
            },
            formatter(params) {
              let html = '';
              if (params && params.length > 0) {
                html += self.format(new Date(JSON.parse(params[0].axisValue).timestamp * 1000), 'MM月dd日');
                for (let i = 0; i < params.length; i += 1) {
                  if (params[i].seriesName === '粉丝增长率') {
                    html += `<br/>${params[i].marker}${params[i].seriesName}: ${(params[i].value - yInterval).toFixed(2)}`;
                  } else if (params[i].seriesName !== '粉丝总数') {
                    html += `<br/>${params[i].marker}${params[i].seriesName}: ${params[i].value}`;
                  }
                }
              }
              return html;
            },
          },
          legend: {
            top: 10,
            left: 10,
            type: 'scroll',
            // orient: 'vertical',
            data: legends,
            selected: legend,
          },
          grid: {
            top: 50,
            left: 12,
            right: 130,
          },
          xAxis: [
            {
              type: 'category',
              data: xData,
              // axisPointer: {
              //   type: 'shadow',
              // },
              axisLabel: {
                formatter(xobjData) {
                  const objData = JSON.parse(xobjData);
                  if (objData.show) {
                    return self.format(new Date(objData.timestamp * 1000), 'MM月dd日');
                  }
                  return '';
                },
              },
            },
          ],
          yAxis: [
            {
              position: 'right',
              type: 'value',
              name: '',
              min: 0,
              max: yMax,
              interval: self.rateNum(yMax),
              // axisLabel: {
              //   formatter: '{value}',
              // },
            },
          ],
          series: [
            {
              name: '粉丝总数',
              type: 'line',
              // yAxisIndex: 0,
              data: fansData.total,
              // showSymbol: false,
              // legendHoverLink: false,
              // tooltip: {
              //   position: [10, 10],
              // },
              // label: {
              //   normal: {
              //     show: false,
              //   },
              //   emphasis: {
              //     show: false,
              //   },
              // },
            },
            {
              name: '粉丝增加总数',
              type: 'bar',
              data: fansData.incrTrend,
            },
            {
              name: '粉丝增长率',
              type: 'line',
              data: fansData.incrRateTrend.map(item => (item + yInterval).toFixed(2)),
            },
            {
              name: '粉丝减少总数',
              type: 'bar',
              data: fansData.descTrend,
            },
            // {
            //   name: '粉丝减少率',
            //   type: 'line',
            //   data: [0, 0, 0, 0, 0, 0, 0],
            // },
            // {
            //   name: '主动取关粉丝数',
            //   type: 'line',
            //   data: [0, 0, 0, 0, 0, 0, 0],
            // },
          ],
        };
        self.myChart.setOption(option);
      });
    },
    dateChange() {
      this.load(this.format(this.dateRate[0], 'yyyy-MM-dd'), this.format(this.dateRate[1], 'yyyy-MM-dd'));
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}*/
</style>
