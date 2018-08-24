<template>
  <div class="main-page">
    <div class="address-field mat-card" @tap="address">
      <block v-if="!!choosenAddress">
        <div class="address-name">
          {{choosenAddress.userName}} {{choosenAddress.telNumber}}
        </div>
        <div class="address-detail">
          {{choosenAddress.provinceName +
          choosenAddress.cityName +
          choosenAddress.countyName +
          choosenAddress.detailInfo}}
        </div>
      </block>
      <div v-else>选择收货地址</div>
    </div>
    <div class="cart-item">
      <div class="mat-list">
        <!-- cart buy -->
        <div class="mat-list-item mat-3-line"
             v-if="!buyRightNow"
             v-for="item in cart"
             :key="item.mark.cid">
          <div class="mat-list-item-content">
            <image class="mat-list-image"
                   v-if="item.model.preview[0]"
                   :src="baseUrl.site + item.model.preview[0].path"/>
            <image class="mat-list-image"
                   v-else
                   src="/static/img/tabbar_cart_selected.png"></image>
            <div class="mat-list-text">
              <div class="mat-line">
                <h3 class="h3">
                  {{item.model.name}}
                </h3>
              </div>
              <div class="mat-line">
                <h4 class="h4">
                  {{item.mark.name}}
                </h4>
              </div>
              <div class="mat-line">
                <div class="p layout-flex flex-row">
                  <span class="flex-none item-price">{{item.mark.priceFix}}</span>
                  <span class="flex"></span>
                  <div class="flex-none layout-flex flex-coumn">
                    <span>x{{item.amount}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- buy right now -->
        <div class="mat-list-item mat-3-line" v-if="buyRightNow">
          <div class="mat-list-item-content">
            <image class="mat-list-image"
                   v-if="buyItem.model.preview[0]"
                   :src="baseUrl.site + buyItem.model.preview[0].path"/>
            <image class="mat-list-image"
                   v-else
                   src="/static/img/tabbar_cart_selected.png"></image>
            <div class="mat-list-text">
              <div class="mat-line">
                <h3 class="h3">
                  {{buyItem.model.name}}
                </h3>
              </div>
              <div class="mat-line">
                <h4 class="h4">
                  {{buyItem.mark.name}}
                </h4>
              </div>
              <div class="mat-line">
                <div class="p layout-flex flex-row">
                  <span class="flex-none item-price">{{buyItem.mark.priceFix}}</span>
                  <span class="flex"></span>
                  <div class="flex-none layout-flex flex-coumn">
                    <span>x{{buyItem.amount}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="cart-submit layout-flex flex-center flex-row">
      <div class="flex"></div>
      <div class="flex-none">
        合计:￥{{ buyRightNow ? buyItem.amount * buyItem.mark.price / 100 : cartTotalPrice / 100 }}
      </div>
      <div class="flex"></div>
    </div>
    <div class="cart-submit layout-flex flex-center flex-row">
      <div class="flex"></div>
      <div class="w-btn primary active flex layout-flex flex-center flex-column submit-big"
           @tap="submit">
        <div class="flex"></div>
        <div class="flex-none">提交订单</div>
        <div class="flex"></div>
      </div>
      <div class="flex"></div>
    </div>
  </div>
</template>

<script>
import WXP from 'minapp-api-promise';
import { mapGetters, mapActions } from 'vuex';
import { jump, base64Decode } from '@/utils';
import { appColor, baseUrl } from '@/utils/constant';
import api from '@/utils/api';

export default {
  data() {
    return {
      appColor,
      baseUrl,
      choosenAddress: null,
      remark: '',
      buyRightNow: false,
      buyItem: null,
    };
  },

  computed: {
    ...mapGetters(['cart', 'cartTotalPrice']),
  },

  methods: {
    jump,
    async address() {
      try {
        const addrRes = await WXP.chooseAddress();
        this.choosenAddress = addrRes;
      } catch (res) {
        if (res.errMsg === 'chooseAddress:fail:auth denied' || res.errMsg === 'chooseAddress:fail auth deny') {
          const status = await WXP.showModal({
            title: '提示',
            content: '您之前没有允许获取地址\n\n是否重新允许？',
            cancelText: '好的',
            cancelColor: appColor.primary,
            confirmText: '不了',
            confirmColor: appColor.warn,
          });
          if (status.cancel) {
            const setting = await WXP.openSetting();
            if (setting && setting.authSetting['scope.address']) {
              console.log('允许获取地址了。');
            } else {
              WXP.showToast({
                title: '您刚才没有授权“通讯地址”哦',
                icon: 'none',
              });
            }
          }
        }
      }
    },
    async submit() {
      if (!this.choosenAddress) {
        WXP.showToast({
          title: '没有填写收货地址',
          icon: 'none',
        });
        WXP.vibrateLong();
        return;
      }

      try {
        const token = WXP.getStorageSync('token');
        const result = await api.post(
          'order',
          {
            items: this.buyRightNow ? [this.buyItem] : this.cart,
            address: this.choosenAddress,
          },
          { title: '正在提交' },
          { Authorization: `Bearer ${token}` },
        );
        if (result.success) {
          // remove item from cart
          if (!this.buyRightNow) {
            this.clearCart();
          }
          jump(`/pages/orderdetail/main?oid=${result.data.oid}&first=true`, 'redirect');
        } else {
          WXP.showToast({
            title: result.msg,
            icon: 'none',
          });
        }
      } catch (e) {
        WXP.showToast({
          title: '网络请求失败',
          icon: 'none',
        });
      }
    },
    ...mapActions(['clearCart']),
  },

  mounted() {
    const query = this.$root.$mp.query;
    if (query.buyrightnow && query.buyrightnow === 'true') {
      this.buyRightNow = true;
      const item = JSON.parse(base64Decode(query.item));
      this.buyItem = item;
    } else {
      this.buyRightNow = false;
    }
  },
};
</script>

<style lang="less">
  @import '../../assets/style/variable';

  .address-field {
    .address-detail {
      color: @black-54;
    }
  }

  .item-price {
    color: @accent;
  }

  .submit-big {
    height: 48px;
  }
</style>
