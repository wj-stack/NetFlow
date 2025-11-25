// This is the structure for the form state (using strings for inputs)
export interface SpeedInfo {
  limit: {
    global: string;
    task: string;
  };
  speed: {
    global: { bs: string; vs: string; ts: string };
    task: { bs: string; vs: string; ts: string };
  };
}

// For the final JSON data structure, uses numbers
export interface FinalSpeedInfo {
  limit: { global: number; task: number };
  speed: {
    global: { bs: number; vs: number; ts: number };
    task: { bs: number; vs: number; ts: number };
  };
  expire?: number;
}

export interface ResponseOnMatch {
  strategy: string;
  strategy_id: string;
  speed_info: FinalSpeedInfo;
}

export interface MatchCondition {
  id: string; // Internal for React keys
  field: string;
  operator: string;
  value: string;
}

export interface StrategyFilter {
  desc: string;
  responseOnMatch: ResponseOnMatch;
  matchAll: { match: string[] }[];
}

export interface StrategyItem {
  filter: StrategyFilter;
}

// Internal representation for the form to make editing easier
export interface StrategyFormState {
  id: string;
  desc: string;
  strategyType: string;
  speedInfo: SpeedInfo;
  duration: string;
  conditions: MatchCondition[];
}

export type MetadataType = 'realtime' | 'offline' | 'user' | 'client';

export interface MetadataItem {
  id: string;
  type: MetadataType;
  label: string;
  value: string;
}