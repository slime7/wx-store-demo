import Vue from 'vue';
import Vuex from 'vuex';
import WXP from 'minapp-api-promise';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    userInfo: null,
    cart: [],
  },

  getters: {
    userInfo: state => state.userInfo,
    cart: state => state.cart,
    cartTotalPrice: (state, getters) => getters.cart.reduce((total, cartItem) =>
      total + (cartItem.amount * cartItem.mark.price), 0),
  },

  actions: {
    addToCart({ state, commit }, { model, mark, amount }) {
      const isInCart = state.cart.find(cartItem => cartItem.mark.cid === mark.cid);
      if (!isInCart) {
        commit('pushToCart', { model, mark, amount });
        WXP.showToast({
          title: '添加成功',
          icon: 'success',
        });
      } else {
        WXP.showToast({
          title: '这个商品已在购物车中\n无需重复添加',
          icon: 'none',
        });
        WXP.vibrateShort();
      }
    },
    clearCart({ commit }) {
      commit('setCartItems', []);
    },
  },

  mutations: {
    // user info
    setUserInfo(state, { userInfo }) {
      // eslint-disable-next-line
      state.userInfo = userInfo;
    },
    // cart
    pushToCart(state, { model, mark, amount }) {
      state.cart.push({ amount, model, mark });
      WXP.setStorageSync('cart', state.cart);
    },
    changeCartItemAmount(state, { item, delta }) {
      const itemInd = state.cart.indexOf(item);
      // eslint-disable-next-line
      state.cart[itemInd].amount += +delta;
      if (state.cart[itemInd].amount < 0) {
        // eslint-disable-next-line
        state.cart[itemInd].amount = 0;
      }
      if (state.cart[itemInd].amount === 0) {
        state.cart.splice(itemInd, 1);
      }
      WXP.setStorageSync('cart', state.cart);
    },
    setCartItems(state, items) {
      // eslint-disable-next-line
      state.cart = items;
      WXP.setStorageSync('cart', state.cart);
    },
    saveCart(state) {
      WXP.setStorageSync('cart', state.cart);
    },
    loadCart(state) {
      const cart = WXP.getStorageSync('cart');
      if (cart) {
        // eslint-disable-next-line
        state.cart = cart;
      }
    },
  },
});

export default store;
