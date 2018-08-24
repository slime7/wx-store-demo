import WXP from 'minapp-api-promise';
import { baseUrl } from './constant';
import interfaces from './interfaces';

const api = {
  async get(path, loadingConfig, header) {
    return this.request(path, 'GET', null, loadingConfig, header);
  },
  async post(path, params, loadingConfig, header) {
    return this.request(path, 'POST', params, loadingConfig, header);
  },
  async delete(path, params, loadingConfig) {
    return this.request(path, 'DELETE', params, loadingConfig);
  },
  async put(path, params, loadingConfig) {
    return this.request(path, 'PUT', params, loadingConfig);
  },
  async getToken(x) {
    const code = encodeURIComponent(x.code);
    const encrypted = encodeURIComponent(x.encrypted);
    const iv = encodeURIComponent(x.iv);
    return this.request(`token?code=${code}&encrypted=${encrypted}&iv=${iv}`, 'GET');
  },
  async request(path, method, params, loadingConfig, header) {
    if (loadingConfig && loadingConfig.title) {
      WXP.showLoading({ title: loadingConfig.title });
    } else {
      WXP.showLoading({ title: '正在加载' });
    }

    const req = {
      url: `${baseUrl.api}${path}`,
      method,
      dataType: 'json',
    };
    if (params) {
      req.data = params;
    }
    if (header) {
      req.header = header;
    }

    const result = await (
      await WXP.request(req)
        .then((response) => {
          if (response.statusCode === 401) {
            WXP.removeStorageSync('token');
            interfaces.checkUser();
          }
          // 后台服务器传过来的JSON数据，小程序端有时收到的是字符串，并不是JSON对象，而且字符串
          // 前面还多了几个零宽空白字符，因此先trim一下(这里用replace函数trim)
          if (typeof response.data === 'string') {
            response.data = JSON.parse(response.data.replace(/(^\s+)|(\s+$)/g, ''));
          }
          if (response.header.token) {
            WXP.setStorageSync('token', response.header.token);
          }
          return response.data;
        })
        .catch(() => {
          WXP.showToast({
            title: '网络请求失败',
            icon: 'none',
          });
        })
    );

    WXP.hideLoading();
    return result;
  },
};

export default api;
