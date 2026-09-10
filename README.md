# SportsHealth · 运动康复 / 功能性训练平台

面向个人自我管理的运动康复内容工作台。通过「今日 / 身体 / 动力链 / 训练」四个入口，整理关注问题、下一步动作、可能的跨部位关联与训练进度。界面以手机阅读为主，并在桌面端切换为有边界的多栏布局。

- **差异化**：内置「动力链（Kinetic Chain）」——按完整关联分组展示所有选中问题、关系、分支与循环，未关联项单独保留，并按「个人观察 / 资料支持 / 需验证」标注；关联不等于因果或诊断。
- **训练结构**：提供不分化、二分化、默认胸/腿/背三分化、四分化、五分化五种模板；「今日」与当前模板同步。训练日准备与个人康复分开，个人任务按上肢/下肢/全身主题匹配、去除重复并限制为最多 3 项。
- **专项功能**：提供跑步、HYROX、健身运动表现三个专区。健身专区以爆发力与力量传递、全身协调与负重移动为主，多方向落地减速为可选补充，不把热身动作当成主体。
- **技术栈**：uni-app（Vue3）一套代码输出 H5 / 微信小程序 / App。
- **内容源**：`content/` 下的结构化 JSON（部位 / 身体问题 / 动作指导 / 视频 / 人群 / 计划）。
- **本地优先**：首次打开为空白工作台。关注项、训练模板、专项目标和按自然日记录的完成状态仅保存在当前浏览器；完成记录保留最近 28 个日期。

## 目录

```
content/              内容数据（纯 JSON，无后端，CMS 替换点）
  types.ts            TypeScript 数据模型（地基 / 契约）
  regions.json        身体部位 + 人体图热区坐标
  conditions.json     身体问题（症状/自测/鉴别提示/危险信号/康复/预防/动力链关联）
  exercises.json      基础康复与功能动作
  performance-exercises.json  22 个专项运动表现动作
  exercise-guidance.json      基础动作的结构化指导
  performance-guidance.json   专项动作的目的/剂量/侧别/进退阶/停止条件/来源
  training-splits.json        五种训练分化模板及每周安排
  functional-programs.json    跑步 / HYROX / 健身运动表现模块
  videos.json         视频链接（B站等，外链跳转）
  personas.json       运动人群（Hyrox / 马拉松 / 久坐）
  programs.json       功能性训练计划
src/
  components/BodyMap.vue      人体图选点（2D 热区，跨端一致）
  components/ConditionCard.vue
  components/ExerciseCard.vue
  data/index.js       数据加载 + 查询/检索/关联 helper
  stores/             版本化的本地工作台状态
  pages/              今日 / 身体 / 动力链 / 训练 / 问题详情
  static/exercises/   项目自有的 WebP 动作教学图
  utils/url.js        跨端打开视频链接
```

## 运行（H5 开发）

```bash
npm install
npm run dev:h5      # 浏览器打开 http://localhost:5173
```

微信小程序：`npm run dev:mp-weixin`，再用 HBuilderX / 微信开发者工具打开 `dist/dev/mp-weixin`。
App：HBuilderX 运行到手机或模拟器（`npm run dev:app` 由 HBuilderX 触发）。

## 数据字段速览（详见 content/types.ts）

| 实体 | 关键字段 |
|---|---|
| 身体问题 Condition | name, aliases(搜索), symptoms(症状), selfTest(自测), differentialNotes(鉴别提示), redFlags(危险信号), rehabExercises, prevention, **upstreamCauses / downstreamSymptoms(动力链)** |
| 动作 Exercise | name, category, difficulty, cues(要点), commonErrors, videos |
| 分化模板 TrainingSplit | frequency, audience, advantages, tradeoffs, recovery, days |
| 专项 Track / Module | audience, purpose, duration, frequency, placement, exercises(含逐项用途) |
| 视频 Video | title, url(B站), verified(是否人工核验) |
| 人群 Persona | name, injuryRisks, programs |
| 计划 Program | name, phases(周/动作) |

## 人体图数据来源与署名

人体底图（正面 / 背面 银色肌肉解剖示意）为 **AI 生成的教学模型美术资产**，用于产品体验演示，**不可用于精确解剖定位**；肌群标注与热点仍需人工审核。正式对外分发前，应替换为准确、授权的解剖资产，并保留相应署名。

## 免责声明

本应用仅供自我健康管理与运动参考，不构成医学诊断/治疗建议。每个问题页均内置「危险信号 · 何时就医」，鹅足区疼痛页另含容易混淆情况的保守鉴别提示。视频为外链（B站等），跳转至第三方平台。
