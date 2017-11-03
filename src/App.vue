<template>
  <div class="app">
    <div class="data-box__hd">
      <a @click="tabIndex = 0" :class="['nav-box__a', { active: tabIndex === 0 }]" href="javascript:;">粉丝趋势分析</a>
      <a @click="tabIndex = 1" :class="['nav-box__a', { active: tabIndex === 1 }]" href="javascript:;">互动分析</a>
    </div>
    <div class="data-box__bd">
      <fans v-show="tabIndex === 0"></fans>
      <interact v-show="tabIndex === 1"></interact>
    </div>
    
  </div>
</template>

<script>
import fans from './components/fans';
import interact from './components/interact';

export default {
  name: 'app',
  components: {
    fans,
    interact,
  },
  data() {
    return {
      tabIndex: 0,
    };
  },
};
</script>

<style>
.app {
  margin: 10px;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
* {
  margin: 0;
  padding: 0;
}
.nav-box__a {
  position: relative;
  display: inline-block;
  padding: 10px 8px;
  color: #333;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
}
.nav-box__a.active:after {
  position: absolute;
  left: 0;
  bottom: 0;
  content: '';
  width: 100%;
  height: 4px;
  background-color: #f7691d;
}

.data-box {
  margin: 10px;
}
.data-box__hd {
  padding-left: 10px;
  background-color: #f2f2f5;
}
.data-box__bd {
  border: 1px solid #f2f2f5;
  padding: 10px;
}
</style>
