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
      <div id="JS_interactEcharts" style="width: 720px; height: 340px;"></div>
      <div class="echarts-rightbar">
        <div class="echarts-rightbar__item">
          <div class="echarts-rightbar__item--title">阅读总数</div>
          <div>{{ weiboReadTrend.readTotal | TotalFormat }}</div>
        </div>
        <div class="echarts-rightbar__item">
          <div class="echarts-rightbar__item--title">发博总数</div>
          <div v-text="weiboReadTrend.weiboTotal"></div>
        </div>
        <!-- <div class="echarts-rightbar__item">
          <div class="echarts-rightbar__item--title">评论总数</div>
          <div v-text="weiboReadTrend.comment"></div>
        </div>
        <div class="echarts-rightbar__item">
          <div class="echarts-rightbar__item--title">点赞总数</div>
          <div v-text="weiboReadTrend.like"></div>
        </div> -->
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
  name: 'Interact',
  filters: {
    TotalFormat(num) {
      if (num && num > 10000) {
        return `${(num * 0.0001).toFixed(2)}万`;
      }
      return num;
    },
  },
  data() {
    return {
      weiboReadTrend: {
        read: 0,
        reposted: 0,
        comment: 0,
        like: 0,
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
    let end = parseInt(new Date().getTime() / 1000, 10) - 86400;
    let start = end - (6 * 24 * 3600);
    start = new Date(start * 1000);
    end = new Date(end * 1000);
    this.load(this.format(start, 'yyyy-MM-dd'), this.format(end, 'yyyy-MM-dd'));
  },
  methods: {
    load(start, end) {
      const self = this;
      axios
        // http://dss.sc.weibo.com
        .get(`${this.global.weiboApi}/pc/aj/chart/content/weiboReadTrend`, {
          params: {
            starttime: start,
            endtime: end,
            // uid: this.global.weiboUid,
            // oauth_token: '',
          },
        })
        .then((res) => {
          const data = res.data;
          if (data.code === 100000) {
            self.init(data.data.chart.weiboReadTrend);
          } else {
            // alert(JSON.stringify(data));
          }
        })
        .catch(() => {
          // alert(String(error));
        });
    },
    rightbar(data) {
      this.weiboReadTrend = data;
    },
    init(data) {
      const self = this;
      self.rightbar({
        readTotal: data.readTotal,
        weiboTotal: data.weiboTotal,
      });
      this.$nextTick(() => {
        if (!self.myChart) {
          self.myChart = echarts.init(document.getElementById('JS_interactEcharts'));
        }
        const legend = {
          阅读数: true,
          发博数: true,
          // 评论数: true,
          // 点赞数: true,
          // 粉丝减少率: false,
          // 主动取关粉丝数: false,
        };
        // const weiboReadTrendData = {
        //   read: [],
        //   reposted: [],
        //   comment: [],
        //   like: [],
        //   // cur off
        //   read: 0,
        //   repostedMax: 0,
        //   commentMax: 0,
        //   likeMax: 0,
        // };
        const weiboReadTrendData = data;
        const xData = [];
        const legends = Object.keys(legend);
        const startTimestamp = parseInt(new Date(data.starttime).getTime() / 1000, 10);
        for (let i = 0; i < data.reads.length; i += 1) {
          const json = {
            timestamp: startTimestamp + (i * 86400),
          };
          if (data.reads.length <= 5) {
            json.show = true;
          } else if ((i + 3) % 5 === 0) {
            json.show = true;
          }
          xData.push(JSON.stringify(json));
        }
        const read = Math.max(...data.reads);
        const readRate = self.rate(read);
        const yMax = readRate * 3;
        console.log(read, readRate, yMax);
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
                  if (params[i].seriesName !== '粉丝总数') {
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
            top: 70,
            left: 50,
            right: 130,
          },
          xAxis: [
            {
              type: 'category',
              data: xData,
              axisPointer: {
                type: 'shadow',
              },
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
              type: 'value',
              name: '阅读数',
              min: 0,
              max: self.rate(Math.max(...data.reads)) * 3,
              interval: self.rate(Math.max(...data.reads)),
              axisLabel: {
                formatter(value) {
                  if (value > 1000) {
                    return `${(value * 0.001)}k`;
                  }
                  return value / 100;
                },
              },
            },
            {
              type: 'value',
              name: '发博数',
              min: 0,
              max: self.rate(Math.max(...data.weibos)) * 3,
              interval: self.rate(Math.max(...data.weibos)),
              axisLabel: {
                formatter: '{value}',
              },
            },
          ],
          series: [
            {
              name: '阅读数',
              type: 'line',
              data: weiboReadTrendData.reads,
            },
            {
              name: '发博数',
              type: 'line',
              yAxisIndex: 1,
              data: weiboReadTrendData.weibos,
            },
            // {
            //   name: '评论数',
            //   type: 'bar',
            //   yAxisIndex: 1,
            //   data: weiboReadTrendData.commentTrend,
            // },
            // {
            //   name: '点赞数',
            //   type: 'bar',
            //   yAxisIndex: 1,
            //   data: weiboReadTrendData.likeTrend,
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
