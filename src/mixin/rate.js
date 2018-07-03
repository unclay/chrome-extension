export default {
  methods: {
    arrMax(arr) {
      return arr.reduce((num1, max) => (num1 > max ? num1 : max), 0);
    },
    rate(number) {
      const rate = Math.ceil(number / 3);
      const numStr = rate.toString();
      const length = numStr.length;
      const base = 10 ** (length - 1);
      if ((rate / base).toString().length === 1) {
        return rate;
      }
      const firstNum = (rate + base).toString().substr(0, 1);
      return firstNum * base;
    },
    rateMax(total) {
      const num = total + 1;
      if (num < 4) {
        return 4;
      } else if (num < 10) {
        return Math.ceil(num / 2) * 2;
      } else if (num < 50) {
        return Math.ceil(num / 5) * 5;
      } else if (num < 100) {
        return Math.ceil(num / 10) * 10;
      } else if (num < 500) {
        return Math.ceil(num / 50) * 50;
      } else if (num < 1000) {
        return Math.ceil(num / 100) * 100;
      } else if (num < 5000) {
        return Math.ceil(num / 500) * 500;
      } else if (num < 10000) {
        return Math.ceil(num / 1000) * 1000;
      }
      return Math.ceil(num / 10000) * 10000;
    },
    rateMaxPercent(percent) {
      if (percent < 0.1) {
        return 1 / 0.1;
      } else if (percent < 0.2) {
        return 1 / 0.2;
      } else if (percent < 0.3) {
        return 1 / 0.3;
      } else if (percent < 0.4) {
        return 1 / 0.4;
      } else if (percent < 0.5) {
        return 1 / 0.5;
      } else if (percent < 0.6) {
        return 1 / 0.6;
      } else if (percent < 0.7) {
        return 1 / 0.7;
      } else if (percent < 0.8) {
        return 1 / 0.8;
      }
      return 1;
    },
    rateBarMax(total, rate, now) {
      const mutiple = total / rate;
      return Math.ceil(now / mutiple) * mutiple;
    },
    rateNum(num) {
      if (num <= 4) {
        return 1;
      } else if (num <= 10) {
        return 2;
      } else if (num < 50) {
        return 5;
      } else if (num < 100) {
        return 10;
      } else if (num < 500) {
        return 50;
      } else if (num < 1000) {
        return 100;
      } else if (num < 5000) {
        return 500;
      } else if (num < 10000) {
        return 1000;
      }
      return 1000;
    },
  },
};
