<template>
<div class="mat-list-item mat-{{lineNumber}}-line"
      hover-class="mat-list-item-hover" hover-start-time="20" hover-stay-time="70"
      @tap="tap">
  <div class="mat-list-item-content">
    <!-- .mat-list-icon .mat-list-avatar .mat-list-image -->
    <!--
    <div class="mat-list-text">
      <div class="mat-line">
        <slot name="line1"></slot>
      </div>
      <div class="mat-line">
        <slot name="line2"></slot>
      </div>
      <div class="mat-line">
        <slot name="line3"></slot>
      </div>
    </div>
    -->
    <slot></slot>
  </div>
</div>
</template>
<script>
export default {
  props: {
    itemData: {
      type: Object,
      default: {},
    },
    lineNumber: {
      type: String,
      default: '1',
    },
    href: {
      type: String,
      default: null,
    },
    hrefQuery: {
      type: Object,
      default: {},
    },
    target: {
      type: String,
      default: 'navigate',
    },
  },

  methods: {
    tap() {
      console.log(this.href, this.hrefQuery);
      return false;
    },
  },
};
</script>
