/**
 * SportsHealth 数据模型 —— TypeScript 类型定义（规范/参考）
 *
 * 这套类型是平台内容的地基。内容以 JSON 形式存放于 content/，
 * App 运行时读取（见 src/data/index.js）。类型用于：
 *   1. 约束内容结构，避免字段缺失；
 *   2. 未来迁移到 CMS / TS 前端 / 后端时的类型契约。
 *
 * 核心关系：
 *   BodyRegion ── Condition ── Exercise（康复 / 预防 / 计划）
 *   Condition ══>(有向观察关系)══> Condition   ← 动力链（不自动声明因果）
 *   Persona ── Program ── Exercise
 */

/** 身体系统 */
export type BodySystem = 'musculoskeletal' | 'nervous' | 'skeletal' | 'other';

/** 人体图上的一个可点击热区坐标（对底图做归一化，0..1） */
export interface Hotspot {
  /** 中心点横向比例（0=图左，1=图右） */
  x: number;
  /** 中心点纵向比例（0=图顶，1=图底） */
  y: number;
  /** 半径比例 */
  r: number;
}

/** 身体部位（对应人体图上的一个热区） */
export interface BodyRegion {
  id: string;
  name: string;                 // 中文名，如「膝关节」
  nameEn?: string;
  parent?: string;              // 父级部位 id（层级）
  system: BodySystem;
  description?: string;
  /** 各视图下的热区坐标。正/背视图可各有坐标，缺省则该视图不可点。 */
  hotspot: {
    front?: Hotspot;
    back?: Hotspot;
  };
}

/** 动力链上的一条有向关联 */
export interface ChainLink {
  /** 关联到的伤病 id */
  conditionId: string;
  /** 关系说明：为什么上游/下游、机制是什么 */
  note: string;
  /** 展示依据：个人记录、一般资料支持、仍需进一步验证 */
  status: 'personal-observation' | 'source-supported' | 'needs-validation';
  /** 仅当资料直接支持当前关联时提供，并允许标记为 source-supported */
  reference?: {
    name: string;
    url: string;
  };
}

/** 自测方法（可选字段：不是每种伤病都有可靠的自我检测） */
export interface SelfTest {
  exists: true;                 // 冗余标记，便于前端判断「是否有自测」
  /** 自测步骤（1~N 步） */
  steps: string[];
  /** 自测视频（Video id） */
  video: string[];
}

/** 伤病 / 病症 */
export interface Condition {
  id: string;
  name: string;                 // 主名
  aliases: string[];            // 别名（供中文/拼音/英文搜索）
  /** 所属身体部位（BodyRegion id，可多个） */
  regions: string[];
  system: BodySystem;

  /** 症状 —— 主观感受：哪里痛、什么动作痛、什么感觉（弹响/酸胀/卡顿/不稳） */
  symptoms: string;
  /** 通俗解释它是什么 */
  description: string;

  /** 自测（若有则提供；没有可靠自测就省略） */
  selfTest?: SelfTest;

  /** 危险信号 —— 什么情况必须马上去医院 */
  redFlags: string[];
  /** 与相邻症状区域的简要区别提示，不用于自我诊断 */
  differentialNotes?: string[];
  /** 保守负荷调整、舒适范围练习与渐进返回提示 */
  managementGuidance?: string[];

  /** 康复训练动作（Exercise id） */
  rehabExercises: string[];
  /** 预防训练动作（Exercise id） */
  prevention: string[];

  /** 动力链：展示在当前项之前的相关观察 */
  upstreamCauses: ChainLink[];
  /** 动力链：展示在当前项之后的相关观察 */
  downstreamSymptoms: ChainLink[];
  /** 弱关联 / 共病（无方向，常同时出现） */
  related?: ChainLink[];

  /** 参考来源（如 obsidian 笔记路径） */
  source?: string;
  references?: { name: string; url: string }[];
  tags?: string[];
  disclaimer: string;
}

export type ExerciseCategory =
  | 'strength'      // 力量
  | 'stability'     // 稳定
  | 'mobility'      // 灵活性/活动度
  | 'activate'      // 激活（低强度唤醒）
  | 'power'         // 爆发力 / 快速发力
  | 'carry'         // 负重行走
  | 'respiratory';  // 呼吸

export interface Exercise {
  id: string;
  name: string;
  targetMuscles: string[];
  category: ExerciseCategory;
  /** 难度 1=入门 2=中等 3=进阶 */
  difficulty: 1 | 2 | 3;
  equipment: string[];          // 器械
  image: string;
  imageAlt: string;
  purpose: string;
  dosage: string;
  side: string;
  setup: string[];
  cues: string[];               // 动作要点
  commonErrors: string[];       // 常见错误
  regression: string;
  progression: string;
  stopConditions: string[];
  references: { name: string; url: string }[];
  contraindications: string[];  // 禁忌症 / 何时不要做
  videos: string[];             // Video id
  source?: string;
}

export interface Video {
  id: string;
  title: string;
  platform: 'bilibili' | 'youtube' | 'other';
  url: string;
  cover?: string;
  durationSec?: number;
  tags: string[];
  /** 视频链接是否经人工确认真实可用（B 站 BV 号可能失效/待补） */
  verified: boolean;
}

export interface Persona {
  id: string;
  name: string;                 // 马拉松 / Hyrox / 久坐办公 ...
  sports: string[];
  /** 该人群的高风险伤病（含说明） */
  injuryRisks: { conditionId: string; note: string }[];
  /** 推荐的计划（Program id） */
  programs: string[];
  /** 预防动作（Exercise id） */
  prevention: string[];
}

export interface ProgramPhase {
  title: string;                // 如 Base / Build / Specific / Taper
  weeks: [number, number];      // 起止周
  exercises: {
    exerciseId: string;
    sets?: number;
    reps?: string;
    note?: string;
  }[];
}

export interface Program {
  id: string;
  name: string;
  personas: string[];           // Persona id
  durationWeeks: number;
  frequency: string;            // 如「每周 3 次」
  difficulty: 1 | 2 | 3;
  description: string;
  phases: ProgramPhase[];
}

export interface TrainingSplitDay {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  day: string;
  focus: string;
  target: string;
  isRest?: boolean;
  supportExerciseIds: string[];
  postNote?: string;
}

export interface TrainingSplit {
  id: string;
  name: string;
  shortName: string;
  frequency: string;
  audience: string;
  summary: string;
  advantages: string[];
  tradeoffs: string[];
  recovery: string;
  days: TrainingSplitDay[];
}

export interface FunctionalModule {
  id: string;
  code: string;
  name: string;
  priority: 'primary' | 'secondary' | 'optional';
  purpose: string;
  duration: string;
  frequency: string;
  placement: string;
  exercises: { exerciseId: string; purpose: string }[];
}

export interface FunctionalTrack {
  id: 'running' | 'hyrox' | 'fitness';
  name: string;
  tagline: string;
  description: string;
  audience: string;
  modules: FunctionalModule[];
}

/** 完整内容库（App 启动时整体加载） */
export interface ContentDB {
  regions: BodyRegion[];
  conditions: Condition[];
  exercises: Exercise[];
  videos: Video[];
  personas: Persona[];
  programs: Program[];
}
