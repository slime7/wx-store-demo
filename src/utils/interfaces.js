import WXP from 'minapp-api-promise';
import store from '@/store';
import { appColor } from './constant';
import api from './api';

const interfaces = {
  async login(userinfoDetail) {
    WXP.setStorageSync('_isLogin', false);

    // 获得登录数据
    let loginData = {};
    try {
      loginData = await WXP.login();
    } catch (e) {
      WXP.showToast({
        title: '登录出错。',
        icon: 'none',
      });
    }

    // 获得微信提供的用户信息
    let userinfoRaw = {};
    if (!userinfoDetail) {
      userinfoRaw = await WXP.getUserInfo({ lang: 'zh_CN' });
    } else {
      userinfoRaw = userinfoDetail;
    }
    if (userinfoRaw.errMsg === 'getUserInfo:ok') {
      if (loginData.code) {
        userinfoRaw.code = loginData.code;

        store.state.userInfo = userinfoRaw.userInfo;
        WXP.setStorageSync('_isLogin', true);

        WXP.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1000,
        });
      } else {
        WXP.showToast({
          title: '获取用户code失败!',
          icon: 'none',
        });
      }
    } else {
      const status = await WXP.showModal({
        title: '提示',
        content: '您之前没有允许登录哦~\n\n是否重新允许登录...',
        cancelText: '好的',
        cancelColor: appColor.primary,
        confirmText: '不了',
        confirmColor: appColor.warn,
      });
      if (status.cancel) { // 假如允许重新登录
        const res = await WXP.openSetting();
        if (res && res.authSetting['scope.userInfo']) {
          console.log('允许重新登录了。');
        } else {
          WXP.showToast({
            title: '您刚才没有授权“用户信息”哦',
            icon: 'none',
          });
        }
      } else {
        WXP.showToast({
          title: '没关系，您可随时重新登录哦',
          icon: 'none',
        });
      }
      return;
    }

    // 获取后台服务器提供的用户信息
    let userinfo = {};
    try {
      userinfo = await api.getToken({
        code: userinfoRaw.code,
        encrypted: userinfoRaw.encryptedData,
        iv: userinfoRaw.iv,
      });
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      WXP.showToast({
        title: `请求获取服务端登录态失败，请关闭后重新再试。${e.message}`,
        icon: 'none',
      });
    }

    if (userinfo.success) {
      try {
        await WXP.setStorage({
          key: 'token',
          data: userinfo.data.token,
        });
      } catch (e) {
        /* WXP.showModal({
         title: '提示',
         content: `客户端存储会话信息失败，请关闭后重新再试。${e.message}`,
         showCancel: false
         }) */
      }
    } else {
      // 登录失败
    }
  },

  checkUser(cb) {
    const state = store.state;
    WXP.checkSession()
      .then(() => {
        console.log('check session success.');
        const isLogin = WXP.getStorageSync('_isLogin');
        const token = WXP.getStorageSync('token');
        if (isLogin && token) {
          if (state.userInfo === null) {
            WXP.getUserInfo({ lang: 'zh_CN' })
              .then((userInfoRaw) => {
                state.userInfo = userInfoRaw.userInfo;
                if (cb) {
                  cb(state.userInfo);
                }
              });
          } else if (cb) {
            cb(state.userInfo);
          }
        } else {
          interfaces.login()
            .then(() => {
              if (state.userInfo && cb) {
                cb(state.userInfo);
              }
            });
        }
      })
      .catch(() => {
        interfaces.login()
          .then(() => {
            if (state.userInfo && cb) {
              cb(state.userInfo);
            }
          });
      });
  },
};

export default interfaces;
