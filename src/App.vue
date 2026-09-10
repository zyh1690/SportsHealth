<script>
export default {
  onLaunch() {
    console.log('SportsHealth App Launch')
  },
}
</script>

<style>
:root {
  --color-bg: #f6f3ec;
  --color-surface: #fffdfa;
  --color-surface-soft: #efeee8;
  --color-text: #172421;
  --color-text-secondary: #52615d;
  --color-text-muted: #7e8a86;
  --color-teal-800: #123f3e;
  --color-teal-700: #1d5f5d;
  --color-teal-500: #3f8984;
  --color-teal-100: #dbeae7;
  --color-teal-050: #eaf3f1;
  --color-amber-100: #f5ebd6;
  --color-amber-700: #8a6425;
  --color-danger-050: #fbefec;
  --color-danger-700: #984d43;
  --border-soft: rgba(23, 74, 72, 0.12);
  --shadow-card: 0 8px 28px rgba(24, 42, 39, 0.07);
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --content-max: 1180px;
}

page {
  min-height: 100%;
  max-width: 100%;
  overflow-x: hidden;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

*,
*::before,
*::after,
view,
text,
input,
button,
image {
  box-sizing: border-box;
}

button::after {
  border: 0;
}

.workspace-page {
  min-height: 100vh;
  max-width: 100%;
  overflow-x: hidden;
}
.workspace-main {
  width: min(100%, var(--content-max));
  min-width: 0;
  margin: 0 auto;
  padding: max(20px, env(safe-area-inset-top)) 18px calc(106px + env(safe-area-inset-bottom));
}
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.page-title {
  display: block;
  font-size: clamp(28px, 6vw, 42px);
  line-height: 1.14;
  letter-spacing: -0.04em;
  font-weight: 800;
  color: var(--color-text);
}
.page-subtitle {
  display: block;
  max-width: 680px;
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.65;
}
.local-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  color: var(--color-teal-700);
  font-size: 12px;
  font-weight: 650;
}
.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin: 28px 0 12px;
}
.section-title {
  margin: 0;
  color: var(--color-text);
  font-size: 19px;
  font-weight: 780;
  letter-spacing: -0.02em;
}
.section-note {
  display: block;
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.5;
}
.surface-card {
  background: var(--color-surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
.primary-button,
.secondary-button,
.ghost-button {
  min-height: 46px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 720;
  line-height: 1;
}
.primary-button {
  color: #fff;
  background: var(--color-teal-800);
  box-shadow: 0 8px 18px rgba(18, 63, 62, 0.18);
}
.secondary-button {
  color: var(--color-teal-800);
  background: var(--color-teal-050);
  border: 1px solid rgba(29, 95, 93, 0.14);
}
.ghost-button {
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--border-soft);
}
.segmented-control {
  display: flex;
  padding: 4px;
  gap: 4px;
  overflow-x: auto;
  border-radius: 16px;
  background: #e8e7e1;
  scrollbar-width: none;
}
.segmented-item {
  min-width: 84px;
  min-height: 44px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 0 auto;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 650;
  border-radius: 12px;
}
.segmented-item.active {
  color: var(--color-teal-800);
  background: var(--color-surface);
  box-shadow: 0 2px 8px rgba(24, 42, 39, 0.09);
}
.empty-state {
  padding: 34px 24px;
  text-align: center;
  background: var(--color-surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
}
.empty-state-title {
  display: block;
  font-size: 20px;
  font-weight: 760;
}
.empty-state-copy {
  display: block;
  max-width: 480px;
  margin: 8px auto 18px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.65;
}
.safety-note {
  padding: 14px 16px;
  color: var(--color-danger-700);
  background: var(--color-danger-050);
  border: 1px solid rgba(152, 77, 67, 0.14);
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.62;
}
.legal-note {
  max-width: 720px;
  margin: 36px auto 0;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.65;
  text-align: center;
}

/* 仍由二级资料页使用的兼容布局。 */
.container { width: min(100%, 920px); margin: 0 auto; padding: 22px 18px 64px; }
.card { background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: var(--radius-md); padding: 16px; box-shadow: var(--shadow-card); }
.chip { min-height: 44px; display: inline-flex; align-items: center; padding: 5px 12px; margin: 0 6px 6px 0; border-radius: 999px; color: var(--color-text-secondary); background: var(--color-surface-soft); font-size: 11px; }
.chip.primary { color: var(--color-teal-700); background: var(--color-teal-050); }
.danger-banner { padding: 14px 16px; color: var(--color-danger-700); background: var(--color-danger-050); border-radius: 14px; font-size: 13px; line-height: 1.6; }
.disclaimer { margin-top: 32px; color: var(--color-text-muted); font-size: 11px; line-height: 1.65; text-align: center; }

@media (min-width: 700px) {
  .workspace-main { padding-left: 30px; padding-right: 30px; }
}
@media (min-width: 900px) {
  .workspace-main { padding: 38px 40px 70px 260px; }
  .page-header { margin-bottom: 28px; }
  .section-title { font-size: 21px; }
}
</style>
