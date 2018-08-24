<template>
  <div class="main-page">
    <div class="user-card mat-card layout-flex flex-row">
      <image class="avatar" v-if="!userInfo" @tap="login" src="/static/img/tabbar_my_selected.png"/>
      <image class="avatar" v-else :src="userInfo.avatarUrl"/>
      <div class="layout-flex flex-column">
        <button open-type="getUserInfo"
                lang="zh_CN"
                @getuserinfo="onGotUserInfo"
                class="nickname"
                v-if="!userInfo">
          授权登录
        </button>
        <div class="nickname" v-else>{{ userInfo.nickName }}</div>
        <div v-if="userInfo && !token" @tap="getToken">重新登录</div>
      </div>
    </div>
    <div class="mat-list">
      <div class="mat-subheader">订单</div>
      <div class="mat-list-item mat-1-line"
           hover-class="mat-list-item-hover" hover-start-time="20" hover-stay-time="70"
           @tap="jump('/pages/orderlist/main?type=1')">
        <div class="mat-list-item-content">
          <div class="mat-list-text">
            <h3 class="mat-line h3">
              待付款
            </h3>
          </div>
        </div>
      </div>
      <div class="mat-list-item mat-1-line"
           hover-class="mat-list-item-hover" hover-start-time="20" hover-stay-time="70"
           @tap="jump('/pages/orderlist/main?type=2')">
        <div class="mat-list-item-content">
          <div class="mat-list-text">
            <h3 class="mat-line h3">
              待发货
            </h3>
          </div>
        </div>
      </div>
      <div class="mat-list-item mat-1-line"
           hover-class="mat-list-item-hover" hover-start-time="20" hover-stay-time="70"
           @tap="jump('/pages/orderlist/main?type=3')">
        <div class="mat-list-item-content">
          <div class="mat-list-text">
            <h3 class="mat-line h3">
              待收货
            </h3>
          </div>
        </div>
      </div>
      <div class="mat-list-item mat-1-line"
           hover-class="mat-list-item-hover" hover-start-time="20" hover-stay-time="70"
           @tap="jump('/pages/orderlist/main?type=4')">
        <div class="mat-list-item-content">
          <div class="mat-list-text">
            <h3 class="mat-line h3">
              已完成
            </h3>
          </div>
        </div>
      </div>
      <mat-divider></mat-divider>
      <div class="mat-subheader">其他</div>
      <div class="mat-list-item mat-1-line"
           hover-class="mat-list-item-hover" hover-start-time="20" hover-stay-time="70"
           @tap="jump('/pages/cart/main', 'tab')">
        <div class="mat-list-item-content">
          <div class="mat-list-text">
            <h3 class="mat-line h3">
              查看购物车
            </h3>
          </div>
        </div>
      </div>
      <div class="mat-list-item mat-1-line"
           hover-class="mat-list-item-hover" hover-start-time="20" hover-stay-time="70">
        <div class="mat-list-item-content contact">
          <div class="mat-list-text">
            <h3 class="mat-line h3">
              联系客服
            </h3>
          </div>
          <button open-type="contact" class="contact-button"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WXP from 'minapp-api-promise';
import store from '@/store';
// import { parseJwtBody } from '@/utils';
import MatDivider from '@/components/mat-divider';
import { jump } from '@/utils';
import interfaces from '@/utils/interfaces';
import { appColor } from '@/utils/constant';
// import api from '@/utils/api';

export default {
  component: {
    'mat-divider': MatDivider,
  },

  data() {
    return {
      appColor,
      token: null,
      // hasUserInfoPermit: false,
    };
  },

  computed: {
    userInfo: {
      get: () => store.state.userInfo,
      set: (info) => {
        store.state.userInfo = info;
      },
    },
  },

  methods: {
    async onGotUserInfo(e) {
      interfaces.login(e.mp.detail);
    },
    login() {
      // const self = this;
      if (this.userInfo === null) {
        interfaces.login();
      }
    },
    getToken() {
      interfaces.checkUser(this.init);
    },
    init() {
      const token = WXP.getStorageSync('token');
      this.token = token;
    },
    jump,
  },

  mounted() {
    this.init();

    // WXP.setClipboardData({ data: '￥nTWV0mGVliX￥' });
  },
};
</script>

<style lang="less">
  @import '../../assets/style/variable';

  .user-card {
    padding: 24px 16px 16px;
    background-color: @primary;
    color: rgba(255, 255, 255, 0.87);

    .avatar {
      width: 80px;
      height: 80px;
      background-color: @accent;
      background-size: cover;
      border-radius: 50%;
      margin-top: -8px;
      margin-right: 16px;
    }

    .nickname {
      font-size: 24px;
      font-weight: 400;
      line-height: 32px;
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      color: rgba(255, 255, 255, 0.87);
    }
  }

  .contact {
    position: relative;

    .contact-button {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      opacity: 0;
    }
  }
</style>
