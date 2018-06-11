// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import { Alert, DatePicker } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App';
import mixinDate from './mixin/date';
import mixinRate from './mixin/rate';

require('./assets/js/ext');

Vue.config.productionTip = false;
Vue.use(Alert);
Vue.use(DatePicker);
Vue.mixin(mixinDate);
Vue.mixin(mixinRate);
Vue.prototype.global = {
  weiboApi: {
    development: '',
    production: 'https://dss.sc.weibo.com',
  }[process.env.NODE_ENV],
  weiboUid: 0,
};
if (process.env.NODE_ENV === 'development' && window.location.search) {
  const query = window.location.search.match(/uid=(\d+)/i);
  if (query && query[1]) {
    Vue.prototype.global.weiboUid = Number(query[1]);
  }
}
if (chrome && chrome.cookies) {
  chrome.cookies.getAll({ domain: 'weibo.com' }, (list) => {
    for (let i = 0; i < list.length; i += 1) {
      if (list[i].name.match(/wb_.*_/gi)) {
        Vue.prototype.global.weiboUid = Number(list[i].name.replace(/wb_.*_/gi, ''));
        break;
      }
    }
  });
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  // template: '<App/>',
  // components: { App },
  render: C => C(App),
});
