/**
 * 跨端打开外部链接（视频跳转 B 站等）。
 * - H5：新标签页打开
 * - App：系统浏览器打开
 * - 小程序：复制链接提示（小程序无法直接打开外部网页，需 web-view/跳转）
 */
export function openUrl(url) {
  if (!url) return
  // #ifdef H5
  window.open(url, '_blank')
  // #endif
  // #ifdef APP-PLUS
  plus.runtime.openURL(url)
  // #endif
  // #ifndef H5 || APP-PLUS
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: '已复制链接，请在浏览器打开', icon: 'none' }),
  })
  // #endif
}
