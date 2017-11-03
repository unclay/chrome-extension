export default {
  methods: {
    format(date, ymt) {
      let type = ymt;
      const week = '日一二三四五六'.split('');
      const month = '一 二 三 四 五 六 七 八 九 十 十一 十二'.split(' ');
      const o = {
        'M+': date.getMonth() + 1, // 月份
        C: month[date.getMonth()], // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        A: date.getHours() < 12 ? '上午' : '下午', // 上下午
        W: week[parseInt(date.getDay(), 10)], // 星期
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        S: date.getMilliseconds(), // 毫秒
      };
      if (/(y+)/.test(type)) {
        type = type.replace(RegExp.$1, String(date.getFullYear()).substr(4 - RegExp.$1.length));
      }
      const oKeys = Object.keys(o);
      for (let i = 0; i < oKeys.length; i += 1) {
        if (new RegExp(`(${oKeys[i]})`).test(type)) {
          type = type.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[oKeys[i]]) : ((`00${o[oKeys[i]]}`).substr(String(o[oKeys[i]]).length)));
        }
      }
      return type;
    },
  },
};
