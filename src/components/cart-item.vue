<template>
  <div class="mat-list-item mat-3-line"
       hover-class="mat-list-item-hover" hover-start-time="20" hover-stay-time="70"
       @tap="itemDetail(item)">
    <div class="mat-list-item-content">
      <image class="mat-list-image"
             v-if="item.model.preview[0]"
             :src="baseUrl.site + item.model.preview[0].path"/>
      <image class="mat-list-image" v-else src="/static/img/tabbar_cart_selected.png"></image>
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
              <span class="item-minus" @tap.stop="cartItemChange(-1)"> - </span>
              <span>{{item.amount}}</span>
              <span class="item-plus" @tap.stop="cartItemChange(1)"> + </span>
            </div>
          </div>
        </div>
      </div>
      <div class="mat-secondary-container">
        <div class="mat-secondary" @tap.stop="cartItemChange(-999999)">
          <image class="image" src="/static/img/baseline_delete_forever_black_48dp.png"></image>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import { baseUrl } from '@/utils/constant';

export default {
  props: {
    item: {
      type: Object,
      default: {},
    },
  },

  data() {
    return {
      baseUrl,
    };
  },

  methods: {
    itemDetail(item) {
      console.log(item);
    },

    cartItemChange(delta) {
      this.changeCartItemAmount({ item: this.item, delta });
    },
    ...mapMutations(['changeCartItemAmount']),
  },
};
</script>
