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
          <div v-text="interactTotal.read"></div>
        </div>
        <div class="echarts-rightbar__item">
          <div class="echarts-rightbar__item--title">转发总数</div>
          <div v-text="interactTotal.reposted"></div>
        </div>
        <div class="echarts-rightbar__item">
          <div class="echarts-rightbar__item--title">评论总数</div>
          <div v-text="interactTotal.comment"></div>
        </div>
        <div class="echarts-rightbar__item">
          <div class="echarts-rightbar__item--title">点赞总数</div>
          <div v-text="interactTotal.like"></div>
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
  name: 'Interact',
  data() {
    return {
      interactTotal: {
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
    let end = parseInt(new Date().getTime() / 1000, 10);
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
        .get(`${this.global.weiboApi}/aj/data/pc/interaction_total`, {
          params: {
            starttime: start,
            endtime: end,
            uid: this.global.weiboUid,
            oauth_token: '',
          },
        })
        .then((res) => {
          const data = res.data;
          if (data.code === 100000) {
            self.init(data.data);
          } else {
            // alert(JSON.stringify(data));
          }
        })
        .catch(() => {
          // alert(String(error));
        });
    },
    rightbar(data) {
      this.interactTotal = data;
    },
    init(data) {
      const self = this;
      self.rightbar({
        read: data.read_count,
        reposted: data.reposted_count,
        comment: data.comment_count,
        like: data.like_count,
      });
      this.$nextTick(() => {
        if (!self.myChart) {
          self.myChart = echarts.init(document.getElementById('JS_interactEcharts'));
        }
        const legend = {
          阅读数: true,
          转发数: true,
          评论数: true,
          点赞数: true,
          // 粉丝减少率: false,
          // 主动取关粉丝数: false,
        };
        const interactData = {
          read: [],
          reposted: [],
          comment: [],
          like: [],
          // cur off
          readMax: 0,
          repostedMax: 0,
          commentMax: 0,
          likeMax: 0,
        };
        const xData = [];
        const legends = Object.keys(legend);
        for (let i = 0; i < data.list_data.length; i += 1) {
          const item = data.list_data[i];
          // if (i === 4) {
          //   item.comment = 26;
          //   item.reposted = 7;
          // }
          // if (i === 3) {
          //   item.reposted = 3;
          // }
          // if (i === 1) {
          //   item.like = 2;
          // }
          // if (i === 6) {
          //   item.read = 66;
          // }
          xData.push(item.day);
          interactData.read.push(item.read);
          interactData.reposted.push(item.reposted);
          interactData.comment.push(item.comment);
          interactData.like.push(item.like);
          // max
          interactData.readMax = Math.max(interactData.readMax, item.read);
          interactData.repostedMax = Math.max(interactData.repostedMax, item.reposted);
          interactData.commentMax = Math.max(interactData.commentMax, item.comment);
          interactData.likeMax = Math.max(interactData.likeMax, item.like);
        }
        const readMax = self.rateMax(interactData.readMax);
        const readRate = self.rateNum(readMax);
        let yMax = self.rateMax(Math.max(interactData.repostedMax, interactData.commentMax, interactData.likeMax));
        yMax = self.rateBarMax(readMax, readRate, yMax);
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              crossStyle: {
                color: '#999',
              },
            },
            formatter(params) {
              let html = '';
              if (params && params.length > 0) {
                html += params[0].axisValue;
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
            left: 30,
            right: 130,
          },
          xAxis: [
            {
              type: 'category',
              data: xData,
              axisPointer: {
                type: 'shadow',
              },
            },
          ],
          yAxis: [
            {
              type: 'value',
              name: '阅读数',
              min: 0,
              max: readMax,
              interval: readRate,
              axisLabel: {
                formatter: '{value}',
              },
            },
            {
              type: 'value',
              name: '转评赞数',
              min: 0,
              max: yMax,
              interval: yMax / (readMax / readRate),
              axisLabel: {
                formatter: '{value}',
              },
            },
          ],
          series: [
            {
              name: '阅读数',
              type: 'line',
              data: interactData.read,
            },
            {
              name: '转发数',
              type: 'bar',
              yAxisIndex: 1,
              data: interactData.reposted,
            },
            {
              name: '评论数',
              type: 'bar',
              yAxisIndex: 1,
              data: interactData.comment,
            },
            {
              name: '点赞数',
              type: 'bar',
              yAxisIndex: 1,
              data: interactData.like,
            },
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
