import Vue from 'vue';
import store from './store';
import App from './App';

Vue.config.productionTip = false;
App.mpType = 'app';

const app = new Vue({
  store,
  ...App,
});
app.$mount();

export default {
  // 这个字段走 app.json
  config: {
    // 页面前带有 ^ 符号的，会被编译成首页，其他页面可以选填，我们会自动把 webpack entry 里面的入口页面加进去
    pages: [
      '^pages/category/main',
    ],
    window: {
      backgroundColor: '#fafafa',
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#3f51b5',
      navigationBarTitleText: 'wx-store-demo',
      navigationBarTextStyle: 'white',
    },
    tabBar: {
      color: '#c5cae9',
      selectedColor: '#3f51b5',
      backgroundColor: '#fff',
      borderStyle: 'black',
      list: [
        {
          pagePath: 'pages/category/main',
          text: '首页',
          selectedIconPath: '/static/img/tabbar_cat_selected.png',
          iconPath: '/static/img/tabbar_cat.png',
        },
        {
          pagePath: 'pages/cart/main',
          text: '购物车',
          selectedIconPath: '/static/img/tabbar_cart_selected.png',
          iconPath: '/static/img/tabbar_cart.png',
        },
        {
          pagePath: 'pages/dashboard/main',
          text: '我的',
          selectedIconPath: '/static/img/tabbar_my_selected.png',
          iconPath: '/static/img/tabbar_my.png',
        },
      ],
    },
  },
};
