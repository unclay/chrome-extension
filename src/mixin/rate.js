export default {
  methods: {
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
