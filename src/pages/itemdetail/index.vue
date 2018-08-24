<template>
  <div class="main-page">
    <div class="item-detail-container" v-if="modelData[0]">
      <div class="item-images">
        <swiper
          indicator-dots="true"
          :indicator-active-color="appColor.primary"
          circular="true"
          v-if="modelData[0].preview.length">
          <block v-for="preview in modelData[0].preview" :key="preview.aid">
            <swiper-item>
              <image class="item-image" :src="baseUrl.site + preview.path" mode="aspectFill"/>
            </swiper-item>
          </block>
        </swiper>
        <image class="item-image"
               v-if="!modelData[0].preview.length"
               src="/static/img/tabbar_cart_selected.png"
               mode="aspectFit"/>
      </div>
      <div class="item-header clearfix">
        <div style="float:left">
          <div class="item-name">{{modelData[0].name}}</div>
          <div class="item-price layout-flex flex-row flex-center flex-wrap">
            <span class="del">
              {{
              selected === -1 ?
              '' :
              (modelMark[selected].priceDiscount !== 0 ? modelMark[selected].priceDiscountFix : '')
              }}
            </span>
            <span>
            {{ selected === -1 ? modelData[0].priceFix : modelMark[selected].priceFix }}
            </span>
            <div class="item-sold layout-flex flex-row flex-center flex-wrap"
                 v-if="selected === -1">
              <div class="flex-none">月销量&nbsp;</div>
              <div class="flex-none">{{ modelData[0].sold }}</div>
            </div>
          </div>
        </div>
        <image class="mark-image"
               v-if="selected >= 0 && modelMark[selected].preview.length"
               :src="baseUrl.site + modelMark[selected].preview[0].path"
               mode="aspectFill"/>
      </div>
      <div class="item-marks layout-flex flex-row flex-center flex-wrap">
        <div class="mark-title flex-none">型号&nbsp;</div>
        <div class="mark w-btn primary flex-none"
             v-for="(mark, markInd) in modelMark" :key="mark.cid"
             :class="{active: markInd === selected}"
             @tap="select(markInd)">
          {{mark.name}}
        </div>
      </div>
      <div class="item-amount layout-flex flex-row flex-center">
        <div class="flex-none">数量&nbsp;</div>
        <div class="flex-none w-btn primary" @tap="changeAmount(-1)">-</div>
        <div class="flex-none w-btn">{{amount}}</div>
        <div class="flex-none w-btn primary" @tap="changeAmount(1)">+</div>
      </div>
      <div class="item-desc">
        <div class="item-desc-title">商品详情</div>
        <wxParse :content="modelContent" :noData="'无内容。'" :imageProp="wxparseImageProp"/>
      </div>
    </div>
    <div class="fab-container">
      <div class="mat-fab cart-button layout-flex flex-column flex-center"
           @tap="tabbar('cart')">
        <span class="flex"></span>
        <image class="image flex-none" src="/static/img/shopping_cart_white_48dp.png"/>
        <span class="flex"></span>
      </div>
    </div>
    <div class="purchase-bar">
      <div class="layout-flex flex-row flex-center">
        <div class="flex bar-button" @tap="tabbar('category')">首页</div>
        <div class="flex bar-button">
          <span>客服</span>
          <button open-type="contact" class="contact-button"></button>
        </div>
        <div class="add-to-cart flex-none" @tap="toCart(false)">加入购物车</div>
        <div class="buy flex-none" @tap="toCart(true)">立即购买</div>
      </div>
    </div>
  </div>
</template>

<script>
import WXP from 'minapp-api-promise';
import { mapState, mapActions } from 'vuex';
import marked from 'marked';
import wxParse from 'mpvue-wxparse';
import { formatCategory, jump, base64Encode } from '@/utils';
import { appColor, baseUrl } from '@/utils/constant';
import api from '@/utils/api';

export default {
  components: {
    wxParse,
  },

  data() {
    return {
      baseUrl,
      appColor,
      cid: null,
      modelData: [],
      modelMark: [],
      error: null,
      loading: false,
      selected: -1,
      amount: 1,
      modelContent: '',
      wxparseImageProp: {
        mode: 'widthFix',
        lazyLoad: true,
      },
    };
  },

  computed: {
    ...mapState(['cart']),
  },

  methods: {
    tabbar(page) {
      WXP.switchTab({ url: `/pages/${page}/main` });
    },
    select(markInd) {
      if (this.selected !== markInd) {
        this.selected = markInd;
      } else {
        this.selected = -1;
      }
    },
    changeAmount(delta) {
      this.amount += delta;
      if (this.amount === 0) {
        this.amount = 1;
      }
    },
    toCart(buyRightNow) {
      if (this.selected === -1) {
        WXP.showToast({
          title: '请选择型号',
          icon: 'none',
        });
        WXP.vibrateLong();
        return;
      }
      const model = this.modelData[0];
      const mark = this.modelMark[this.selected];
      const cartModel = {
        model: { cid: model.cid, name: model.name, preview: model.preview },
        mark: {
          cid: mark.cid,
          name: mark.name,
          price: mark.price,
          priceFix: mark.priceFix,
        },
        amount: this.amount,
      };
      if (buyRightNow) {
        const item64 = base64Encode(JSON.stringify(cartModel));
        jump(`/pages/presubmit/main?buyrightnow=true&item=${item64}`);
      } else {
        this.addToCart(cartModel);
      }
    },
    async getItemData() {
      this.loading = true;

      try {
        const result = await api.get(
          `category?pagesize=0&sort=asc&q=parent_self:${this.cid}+level:2,3`,
        );

        if (result.success) {
          const cats = formatCategory(result.data.category);
          this.modelData = cats.filter(cat => cat.cid === this.cid);
          this.modelMark = cats.filter(cat => cat.parentId === this.cid);
          this.modelContent = this.modelData[0].content ? marked(this.modelData[0].content) : '';
        } else {
          this.error = result.msg;
        }
      } catch (e) {
        this.error = '请求服务器失败。';
      } finally {
        this.loading = false;
      }
    },
    init() {
      this.modelData = [];
      this.modelMark = [];
      this.modelContent = '';
      this.selected = -1;
      this.amount = 1;
      this.error = null;
    },
    ...mapActions(['addToCart']),
  },

  mounted() {
    const query = this.$root.$mp.query;
    this.cid = +query.cid;
    this.getItemData();
  },

  beforeMount() {
    this.init();
  },

  onShareAppMessage() {
    return {
      title: `在fg86购买 ${this.modelData[0].name}`,
      path: `/pages/itemdetail/main?cid=${this.cid}`,
      imageUrl: this.modelData[0].preview.length ?
        `${this.baseUrl.site}${this.modelData[0].preview[0].path}` :
        '/static/img/tabbar_cart_selected.png',
    };
  },
};
</script>

<style lang="less">
  @import '../../assets/style/variable';
  @import url('~mpvue-wxparse/src/wxParse.css');

  .item-detail-container {
    swiper {
      height: 100%;
    }

    .item-images {
      position: relative;
      height: 360px;

      .item-image {
        width: 100%;
        height: 100%;
      }
    }

    .item-header, .item-amount, .item-desc, .item-marks {
      padding: 12px;
      font-size: 14px;

      .item-name {
        font-size: 24px;
        font-weight: 500;
      }

      .item-price {
        font-size: 16px;
        color: @accent;

        .del {
          color: @black-54;
        }
      }

      .mark-image {
        width: 50px;
        height: 50px;
        margin-left: 16px;
        float: left;
      }

      .mark-titile {
        font-weight: 500;
        margin: 0 2px;
      }

      .item-desc-title {
        display: none;
        text-align: center;
        font-size: 16px;
        color: @primary;
        border-bottom: 1px solid @black-54;
        margin-bottom: 8px;
      }

      .wxParse {
        font-size: 16px;

        .img {
          vertical-align: bottom;
        }
      }
    }

    .item-sold {
      margin-left: 8px;
      color: @black-87;
    }
  }

  .main-page {
    padding-bottom: 48px;
  }

  .fab-container {
    position: fixed;
    right: 0;
    bottom: 48px;

    .cart-button {
      line-height: 40px;
      width: 40px;
      height: 40px;
      margin: 16px 8px;
      vertical-align: middle;
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, .26);
      border-radius: 50%;
      background-clip: padding-box;
      align-items: center;
      text-align: center;
      background-color: @primary;
      color: #fff;

      .image {
        width: 24px;
        height: 24px;
      }
    }
  }

  .purchase-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 48px;
    border-top: 1px solid @warn;
    background-color: #fafafa;
    text-align: center;

    .bar-button {
      position: relative;
      height: 48px;
      line-height: 48px;
    }

    .contact-button {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      opacity: 0;
    }

    .add-to-cart, .buy {
      height: 100%;
      padding: 0 12px;
      margin-left: 8px;
      text-align: center;
      background-color: #ff5722;
      color: #fff;
      font-size: 18px;
      line-height: 48px;
      border: none;
      border-radius: 0;
    }

    .buy {
      margin-left: 0;
      background-color: @warn;
    }
  }
</style>
