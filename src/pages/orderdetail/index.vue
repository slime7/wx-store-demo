<template>
  <div class="main-page">
    <div class="order-detail" v-if="order">
      <div class="order-success-first mat-card" v-if="first">
        下单成功
      </div>
      <div class="order-status mat-card">
        <p>订单状态：{{ order.status_text }}</p>
        <p>订单编号：{{ order.oid }}</p>
        <p>下单时间：{{ order.time }}</p>
        <div class="layout-flex flex-row" v-if="order.status === 1">
          <div class="flex"></div>
          <div class="pay w-btn primary active flex" @tap="pay">付款</div>
          <div class="flex"></div>
        </div>
      </div>
      <div class="order-address mat-card">
        <p>商品金额：<span class="sum">￥{{ order.sum / 100 }}</span></p>
        <p>收货地址：
          <span v-if="order.address">
            {{order.address.provinceName + order.address.cityName + order.address.countyName + order.address.detailInfo}}
          </span>
        </p>
        <p>收货人：<span v-if="order.address">{{ order.address.userName }}</span></p>
        <p v-if="order.diliver" @tap="setClipboard(order.diliver, '快递单号已复制到剪切板')">
          快递单号：<span>{{ order.diliver }}</span>
        </p>
      </div>
      <div class="order-items mat-card">
        <div class="mat-list">
          <div class="mat-list-item mat-3-line"
               v-for="(item, itemIndex) in order.item" :key="itemIndex">
            <div class="mat-list-item-content">
              <image class="mat-list-image"
                     v-if="item.model.preview[0]"
                     :src="baseUrl.site + item.model.preview[0].path"/>
              <image class="mat-list-image" v-else
                     src="/static/img/tabbar_cart_selected.png"></image>
              <div class="mat-list-text">
                <div class="mat-line">
                  <h3 class="h3">
                    {{ item.model.name }}
                  </h3>
                </div>
                <div class="mat-line">
                  <h4 class="h4">
                    {{ item.mark.name }}
                  </h4>
                </div>
                <div class="mat-line">
                  <div class="p layout-flex flex-row">
                    <span class="flex-none item-price">{{ item.priceFix }}</span>
                    <span class="flex"></span>
                    <div class="flex-none layout-flex flex-coumn">
                      <span>x{{ item.amount }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WXP from 'minapp-api-promise';
import { baseUrl } from '@/utils/constant';
import api from '@/utils/api';
import { formatPrice, setClipboard } from '@/utils';

export default {
  data() {
    return {
      baseUrl,
      oid: null,
      order: null,
      first: false,
      error: null,
    };
  },

  methods: {
    init() {
      this.oid = null;
      this.order = null;
      this.first = false;
      this.error = null;
    },
    async getOrderData() {
      const token = WXP.getStorageSync('token');
      const orderUrl = `order?q=order_id:${this.oid}`;
      try {
        const result = await api.get(
          orderUrl,
          null,
          { Authorization: `Bearer ${token}` },
        );

        if (result.success) {
          this.order = result.data.order[0];
          this.order.item.forEach((item, ind) => {
            this.order.item[ind].priceFix = formatPrice(item.price);
          });
          if (this.first) {
            this.pay();
          }
        } else {
          this.error = result.msg;
        }
      } catch (e) {
        this.error = '请求服务器失败。';
      }
    },
    async pay() {
      const oid = this.oid;
      if (!oid) {
        return;
      }
      const payReq = await api.get(`wxpay?oid=${oid}`);
      if (payReq && payReq.success) {
        const payData = payReq.data;
        try {
          const result = await WXP.requestPayment({
            timeStamp: payData.pay_param.timeStamp,
            nonceStr: payData.pay_param.nonceStr,
            package: payData.pay_param.package,
            signType: 'MD5',
            paySign: payData.pay_param.paySign,
          });
          if (result.errMsg === 'requestPayment:ok') {
            this.first = false;
            this.error = null;
            this.getOrderData();
          }
        } catch (e) {
          if (e.errMsg !== 'requestPayment:fail cancel') {
            WXP.showToast({
              title: `支付失败: ${e.err_desc}`,
              icon: 'none',
            });
          }
        }
      }
    },
    setClipboard,
  },

  mounted() {
    const query = this.$root.$mp.query;
    if (!query.oid) {
      return;
    }
    this.oid = +query.oid;
    if (query.first) {
      this.first = true;
    }
    this.getOrderData();
  },

  beforeMount() {
    this.init();
  },
};
</script>

<style lang="less">
  @import '../../assets/style/variable';

  .order-detail {
    .order-success-first {
      background-color: #4caf50;
      color: rgba(255, 255, 255, .87);
    }
    .pay {
      font-size: 16px;
    }
    .sum {
      color: @accent;
    }

    .order-items {
      padding: 0;
    }
  }

  .item-price {
    color: @accent;
  }
</style>
