import { MetadataItem, SpeedInfo } from "./types";

export const STRATEGY_TYPES = [
  { value: "spike_fill_valley", label: "冲高&填谷策略 (Spike & Fill)" },
  { value: "speed_limit", label: "限速策略 (Speed Limit)" },
  { value: "trial_acceleration", label: "试用加速 (Trial)" },
  { value: "base_guarantee", label: "基础保底 (Base Guarantee)" },
  { value: "ladder_boost", label: "阶梯升档 (Ladder Boost)" },
];

export const MATCH_FIELDS = [
  { value: "user.type", label: "用户类型 (User Type)" },
  { value: "effective.period", label: "生效时间 (Time Period)" },
  { value: "tags.realtime", label: "实时标签 (Realtime Tag)" },
  { value: "tags.offline", label: "离线标签 (Offline Tag)" },
  { value: "client.type", label: "客户端类型 (Client)" },
];

export const MATCH_OPERATORS = [
  { value: "in", label: "包含 (IN)" },
  { value: "between", label: "区间 (BETWEEN)" },
  { value: "==", label: "等于 (EQUALS)" },
  { value: ">=", label: "大于等于 (>=)" },
  { value: "<=", label: "小于等于 (<=)" },
  { value: ">", label: "大于 (>)" },
  { value: "<", label: "小于 (<)" },
];

export const INITIAL_SPEED_INFO: SpeedInfo = {
  limit: {
    global: "",
    task: "",
  },
  speed: {
    global: { bs: "", vs: "", ts: "" },
    task: { bs: "", vs: "", ts: "" },
  },
};

export const DEFAULT_METADATA: MetadataItem[] = [
  // Realtime Tags
  { id: 'rt1', type: 'realtime', label: 'High Bandwidth Usage', value: 'high_bw_usage' },
  { id: 'rt2', type: 'realtime', label: 'New Device', value: 'new_device' },
  
  // Offline Tags
  { id: 'ot1', type: 'offline', label: 'Churn Risk: High', value: 'churn_high' },
  { id: 'ot2', type: 'offline', label: 'Loyal Customer', value: 'loyal_cust' },
  { id: 'ot3', type: 'offline', label: 'Edu Network', value: 'edu_net' },

  // User Types
  { id: 'u0', type: 'user', label: '未登录', value: '0' },
  { id: 'u1', type: 'user', label: '普通用户', value: '1' },
  { id: 'u2', type: 'user', label: '老油条用户', value: '2' },
  { id: 'u3', type: 'user', label: '白金会员 (Platinum)', value: '3' },
  { id: 'u4', type: 'user', label: '超级会员 (Super)', value: '4' },
  { id: 'u5', type: 'user', label: '负毛利用户', value: '5' },

  // Client Types
  { id: 'c1', type: 'client', label: 'Android', value: 'android' },
  { id: 'c2', type: 'client', label: 'iOS', value: 'ios' },
  { id: 'c3', type: 'client', label: 'PC', value: 'pc' },
  { id: 'c4', type: 'client', label: 'Web', value: 'web' },
];