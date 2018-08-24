<template>
  <div class="main-page">
    <div class="order-list">
      <div class="order" v-for="(order, o_index) in orders" :key="order.oid"
           @tap="jump('/pages/orderdetail/main?oid=' + order.oid)">
        <div class="order-head">
          <div class="layout-flex flex-row flex-wrap flex-center">
            <div class="flex-50">
              <span>订单号：{{order.oid}}</span>
            </div>
            <div class="flex-50">
              <span>{{order.time}}</span>
            </div>
          </div>
        </div>
        <div class="order-body">
          <div class="order-info layout-flex flex-row flex-wrap">
            <div class="flex-33">
              <span>总额：</span>
              <span>￥{{order.sum / 100}}</span>
            </div>
            <div class="flex-33">
              <span>买家：</span>
              <span>{{order.client_name}}</span>
            </div>
            <div class="flex">
              <span>状态：</span>
              <span>{{ order.status_text }}</span>
            </div>
            <div class="flex-100" v-if="order.remark">
              <span>备注：</span>
              <span>{{order.remark}}</span>
            </div>
          </div>
          <mat-divider></mat-divider>
          <div class="order-items">
            <div class="order-item layout-flex flex-column"
                 v-for="(item, i_index) in order.item" :key="item.model.cid">
              <div class="order-item-title">{{item.model.name}} {{item.mark.name}}</div>
              <div class="order-item-price">￥{{item.price / 100}} x {{item.amount}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="layout-flex flex-column flex-center" v-if="!(orders && orders.length)">
        <div class="flex">您暂时没有订单</div>
      </div>
    </div>
  </div>
</template>

<script>
import WXP from 'minapp-api-promise';
import { jump } from '@/utils';
import { baseUrl } from '@/utils/constant';
import api from '@/utils/api';
import MatDivider from '@/components/mat-divider';

export default {
  components: {
    'mat-divider': MatDivider,
  },

  data() {
    return {
      baseUrl,
      type: null,
      orders: null,
      pager: null,
      error: null,
      loading: false,
      loaderror: false,
    };
  },

  methods: {
    jump,
    async getOrders() {
      const token = WXP.getStorageSync('token');
      const p = !this.pager ? 1 : this.pager.page + 1;
      const status = this.type;

      if (this.pager && this.pager.page * this.pager.pagesize >= this.pager.count) {
        return;
      }

      try {
        this.loading = true;
        const result = await api.get(
          `order?page=${p}&q=status:${status}`,
          { title: '加载列表' },
          { Authorization: `Bearer ${token}` },
        );

        if (result.success) {
          if (this.orders === null) {
            this.orders = result.data.order;
          } else {
            this.orders = [...this.orders, ...result.data.order];
          }
          this.pager = result.data.pager;
        } else {
          this.error = result.msg;
        }
      } catch (e) {
        this.error = '请求服务器失败。';
        this.loaderror = true;
      } finally {
        this.loading = false;
      }
    },
    init() {
      this.type = null;
      this.orders = null;
      this.pager = null;
      this.error = null;
    },
  },

  mounted() {
    const query = this.$root.$mp.query;
    if (query.type) {
      this.type = query.type;
      this.getOrders();
    }
  },

  beforeMount() {
    this.init();
  },

  onReachBottom() {
    if (!this.loading) {
      this.getOrders();
    }
  },
};
</script>

<style lang="less">
  @import '../../assets/style/variable';
  /* order */
  .order-list {
    padding: 8px;
  }

  .order-head, .order-body {
    background-color: #fff;
    border: 1px solid #ddd;
    border: 1px solid rgba(86, 61, 124, .2);
    padding: 8px;
  }

  .order-head {
    background-color: #f5f5f5;
  }

  .order:hover > .order-head {
    border-left-color: #9889ae;
    border-left-color: rgba(86, 61, 124, .6);
    border-top-color: #9889ae;
    border-top-color: rgba(86, 61, 124, .6);
    border-right-color: #9889ae;
    border-right-color: rgba(86, 61, 124, .6);
  }

  .order:hover > .order-body {
    border-left-color: #9889ae;
    border-left-color: rgba(86, 61, 124, .6);
    border-bottom-color: #9889ae;
    border-bottom-color: rgba(86, 61, 124, .6);
    border-right-color: #9889ae;
    border-right-color: rgba(86, 61, 124, .6);
  }

  .order-head + .order-body {
    border-top: none;
  }

  .order {
    padding: 8px 0;
  }

  .order + .order {
    margin-top: 15px;
  }

  .order-info {
    margin-bottom: 8px;
  }

  .order-item {
    height: 48px;
    color: rgba(0, 0, 0, .87);
    padding: 0 16px;
    justify-content: center;
  }

  .order-item-title {
    font-weight: 400;
  }

  .order-item-price {
    color: rgba(0, 0, 0, .54);
    font-weight: 500;
  }
</style>
