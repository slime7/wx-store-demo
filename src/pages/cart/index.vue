<template>
  <div class="main-page">
    <div class="cart-list">
      <div class="mat-list">
        <block v-for="(cartItem, cartIndex) in cart" :key="cartItem.cid">
          <span :data-model="cartItem.model.name" :data-cid="cartItem.cid"></span>
          <cart-item :item="cartItem"></cart-item>
        </block>
      </div>
    </div>
    <div class="cart-submit-bar">
      <div class="layout-flex flex-row flex-center">
        <div class="flex"></div>
        <div class="cart-total flex-none">总价：￥{{cartTotalPrice / 100}}</div>
        <div class="cart-submit flex-none" @tap="cartSubmit()">结算</div>
      </div>
    </div>
  </div>
</template>

<script>
  import WXP from 'minapp-api-promise';
  import { mapGetters } from 'vuex';
  import CartItem from '@/components/cart-item';

  export default {
    components: {
      'cart-item': CartItem,
    },

    computed: {
      ...mapGetters(['cart', 'cartTotalPrice']),
    },

    methods: {
      cartSubmit() {
        const token = WXP.getStorageSync('token');
        if (!token) {
          WXP.switchTab({ url: '/pages/dashboard/main' });
        }
        WXP.navigateTo({ url: '/pages/presubmit/main' });
      },
    },
  };
</script>

<style lang="less">
  @import '../../assets/style/variable';

  .cart-list {
    margin-bottom: 48px;

    .item-price {
      color: @accent;
    }

    .item-minus, .item-plus {
      padding: 0 8px;
      background-color: @black-12;
      margin: 0 4px;
    }
  }

  .cart-submit-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 48px;
    border-top: 1px solid @primary;
    background-color: #fafafa;

    & > view {
      height: 100%;
    }

    .cart-total {
      color: @accent;
      font-weight: 500;
    }

    .cart-submit {
      height: 100%;
      padding: 0 12px;
      margin-left: 8px;
      text-align: center;
      background-color: @primary;
      color: #fff;
      font-size: 18px;
      line-height: 48px;
      border: none;
      border-radius: 0;
    }
  }
</style>
