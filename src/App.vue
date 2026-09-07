<script>
export default {
  onLaunch: function () {
    console.log('SportsHealth App Launch')
  },
  onShow: function () {},
  onHide: function () {},
}
</script>

<style>
/* 全局页面公共样式 */
page {
  background-color: #f5f4f0;
  color: #1f1f1f;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;
}
.container {
  padding: 20rpx 32rpx 60rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f1f1f;
  margin: 28rpx 0 16rpx;
}
.section-sub {
  font-size: 24rpx;
  color: #8a8a8a;
  margin-bottom: 12rpx;
}
.card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.chip {
  display: inline-flex;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  background: #eeefed;
  color: #5c5c5c;
  font-size: 22rpx;
  margin-right: 10rpx;
}
.chip.primary { background: #e4f0ef; color: #2b7876; }
.danger-banner {
  background: #fdf0ee;
  border-radius: 12rpx;
  padding: 16rpx 18rpx;
  color: #a5443a;
  font-size: 24rpx;
  line-height: 1.6;
}
</style>
