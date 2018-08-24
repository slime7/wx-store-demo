<script>
import WXP from 'minapp-api-promise';
import interfaces from '@/utils/interfaces';

export default {
  created() {
    this.$store.commit('loadCart');

    WXP.getSetting()
      .then((settings) => {
        const hasUserInfoPermit = settings.authSetting ? settings.authSetting['scope.userInfo'] : false;

        if (hasUserInfoPermit) {
          interfaces.checkUser();
        }
      });
  },
};
</script>

<style lang="less">
  @import './assets/style/main';
  @import './assets/style/matlist';
</style>
