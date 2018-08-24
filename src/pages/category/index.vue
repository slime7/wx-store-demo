<template>
  <div class="main-page">
    <div class="category-list">
      <div class="category-album" v-for="(album, albumInd) in albums" :key="albumInd">
        <div class="album-name layout-flex flex-column flex-center" v-if="0">
          <span class="flex"></span>
          <span class="flex-none">{{album.name}}</span>
          <span class="flex"></span>
        </div>
        <div class="album-post" v-if="album.post.path">
          <image class="image"
                 :src="baseUrl.site + album.post.path" mode="widthFix"
                 @tap="postjump(album.post)"/>
        </div>
        <div class="album-content layout-flex flex-row flex-wrap">
          <div class="album-item-container"
               v-for="(model, modelInd) in album.modelDetail" :key="modelInd"
               @tap="itemDetail(model.cid)">
            <div class="item-cover">
              <image class="item-image"
                     v-if="model.preview && model.preview[0]"
                     :src="baseUrl.site + model.preview[0].path"
                     mode="aspectFit"/>
              <image class="item-image"
                     v-if="!(model.preview && model.preview[0])"
                     src="/static/img/tabbar_cart_selected.png"
                     mode="aspectFit"/>
            </div>
            <div class="item-desc">
              <div>{{model.name}}</div>
              <div class="item-price">
                {{model.priceFix}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="layout-flex flex-row flex-center" v-if="loaderror">
      <div class="flex" @tap="getCategory">加载列表失败，请点击刷新试试。</div>
    </div>
  </div>
</template>

<script>
import WXP from 'minapp-api-promise';
import { formatCategory, jump } from '@/utils';
import { baseUrl } from '@/utils/constant';
import api from '@/utils/api';

export default {
  data() {
    return {
      baseUrl,
      albums: null,
      category: null,
      error: null,
      loading: false,
      loaderror: false,
    };
  },

  methods: {
    itemDetail(itemId) {
      WXP.navigateTo({ url: `/pages/itemdetail/main?cid=${itemId}` });
    },
    async getCategory() {
      this.loaderror = false;
      try {
        const album = await api.get(
          'album',
          { title: '加载列表' },
        );

        if (album.success) {
          this.albums = album.data;
        } else {
          this.error = album.msg;
          return;
        }
      } catch (e) {
        this.error = '请求服务器失败。';
        this.loaderror = true;
        return;
      } finally {
        this.loading = false;
      }

      let cidInAlbum = [];
      this.albums.forEach((album) => {
        cidInAlbum = [...cidInAlbum, ...album.model];
      });
      cidInAlbum = [...new Set(cidInAlbum)];

      try {
        const category = await api.get(
          `category?pagesize=0&sort=asc&q=level:2+cat_id:${cidInAlbum.join()}`,
          { title: '加载列表' },
        );

        if (category.success) {
          this.category = formatCategory(category.data.category);
        } else {
          this.error = category.msg;
          return;
        }
      } catch (e) {
        this.error = '请求服务器失败。';
        this.loaderror = true;
        return;
      } finally {
        this.loading = false;
      }

      this.albums.forEach((album, ind) => {
        const models = [];
        album.model.forEach((m) => {
          models.push(this.category.find(c => c.cid === m));
        });
        this.albums[ind].modelDetail = models;
      });
    },
    postjump(post) {
      if (post.link) {
        jump(post.link);
      }
    },
  },

  mounted() {
    this.getCategory();
  },

  onShareAppMessage() {
    return {
      title: '飞戈优选',
      path: '/pages/category/main',
    };
  },
};
</script>

<style lang="less">
  @import '../../assets/style/variable';

  .del {
    text-decoration: line-through;
  }

  .category-list {
    padding: 8px;
  }

  .category-album {
    width: 100%;
    position: relative;

    .album-name {
      height: 48px;
      line-height: 24px;
      margin: 0;
      color: @black-87;
      font-size: 24px;
      font-weight: 500;
      display: flex;
      box-sizing: border-box;
      padding: 20px 16px 4px;
      align-items: center;

      &:first-child {
        margin-top: -8px;
      }
    }

    .album-post {
      margin-bottom: 8px;

      .image {
        width: 100%;
      }
    }

    .album-content {
      position: relative;
      display: block;
      margin: -2px;

      .album-item-container {
        position: relative;
        flex-basis: 33.33%;
        padding: 0 2px;

        .item-cover {
          position: relative;
          max-width: 100%;
          height: 0;
          padding-bottom: calc(100%);
          overflow: hidden;

          .item-image {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: auto;
            height: auto;
          }
        }

        .item-desc {
          position: relative;
          max-width: 100%;
          padding: 4px 4px 16px;
          font-size: 14px;
        }

        .item-price {
          color: @accent;
        }
      }
    }
  }
</style>
